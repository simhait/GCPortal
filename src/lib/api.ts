import { supabase } from './supabase';
import { KPI, KPIValue, School, Goal, User, SchoolMetrics, SchoolBenchmark, UserKPIPreference } from '../types';

// Special Diets API functions
export async function getDietProfiles(districtId: string) {
  try {
    const { data, error } = await supabase
      .from('diet_profiles')
      .select(`
        id,
        name,
        description,
        category:diet_categories(id, name),
        restrictions:diet_restrictions(
          id,
          ingredient:diet_ingredients(name, description),
          notes
        ),
        student_diets(count)
      `)
      .eq('district_id', districtId);

    if (error) throw error;

    return data.map(profile => ({
      ...profile,
      studentCount: profile.student_diets?.[0]?.count || 0
    }));
  } catch (error) {
    throw new Error(`Failed to fetch diet profiles: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getDietRecipes(districtId: string) {
  try {
    const { data, error } = await supabase
      .from('diet_recipes')
      .select(`
        id,
        name,
        description,
        category,
        ingredients,
        nutrition_info,
        diet_profile_recipes(
          diet_profile_id,
          is_verified
        )
      `)
      .eq('district_id', districtId);

    if (error) throw error;

    // Group recipes by diet profile
    const recipesByProfile = data.reduce((acc, recipe) => {
      recipe.diet_profile_recipes?.forEach(mapping => {
        if (!acc[mapping.diet_profile_id]) {
          acc[mapping.diet_profile_id] = [];
        }
        acc[mapping.diet_profile_id].push({
          id: recipe.id,
          name: recipe.name,
          description: recipe.description,
          category: recipe.category,
          ingredients: recipe.ingredients,
          nutrition_info: recipe.nutrition_info,
          is_verified: mapping.is_verified
        });
      });
      return acc;
    }, {} as Record<string, any[]>);

    return recipesByProfile;
  } catch (error) {
    throw new Error(`Failed to fetch diet recipes: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getStudentDiets(districtId: string) {
  try {
    const { data, error } = await supabase
      .from('student_diets')
      .select(`
        id,
        student_id,
        school:schools(id, name),
        profile:diet_profiles(
          id,
          name,
          restrictions:diet_restrictions(
            ingredient:diet_ingredients(name)
          )
        ),
        is_active,
        start_date,
        end_date,
        notes
      `)
      .eq('district_id', districtId)
      .eq('is_active', true);

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch student diets: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Document upload and processing
export async function uploadDocument(file: File) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // Get user's district_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('district_id')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;
    if (!userData?.district_id) throw new Error('User district not found');

    // Create storage path: documents/user_id/district_id/timestamp_filename
    const timestamp = new Date().getTime();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = `${user.id}/${userData.district_id}/${fileName}`;

    // Create document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: filePath,
        status: 'uploading',
        user_id: user.id,
        district_id: userData.district_id
      })
      .select()
      .single();

    if (docError) throw docError;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      // Update document status to error if upload fails
      await supabase
        .from('documents')
        .update({
          status: 'error',
          error_message: uploadError.message
        })
        .eq('id', document.id);
      throw uploadError;
    }

    // Update document status to processing
    await supabase
      .from('documents')
      .update({
        status: 'processing'
      })
      .eq('id', document.id);

    // Return document record
    return document;
  } catch (error) {
    throw new Error(`Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function getDocuments() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function getDocumentUrl(filePath: string) {
  try {
    const { data: { publicUrl }, error } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    if (error) throw error;
    return publicUrl;
  } catch (error) {
    throw new Error(`Failed to get document URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Add proper error handling for deployment status
async function getDeploymentStatus() {
  try {
    const response = await fetch('/api/deploy/status');
    if (!response.ok) {
      if (response.status === 404) {
        // Ignore 404s for deploy status
        return null;
      }
      throw new Error(`Deploy status check failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      // Ignore 404s
      return null;
    }
    throw error;
  }
}

// User Profile
export async function updateUserProfile(userId: string, updates: Partial<User>) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  } catch (error) {
    throw new Error(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function uploadAvatar(userId: string, file: File) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload the file to avatars bucket
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { 
        upsert: true,
        contentType: file.type 
      });

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update user profile with new avatar URL
    const { data, error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;
    return data as User;
  } catch (error) {
    throw new Error(`Failed to upload avatar: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// KPIs
export async function getKPIs(districtId: string) {
  try {
    const query = supabase
      .from('kpis')
      .select(`
        *,
        relationships:kpi_relationships!source_kpi_id(
          target_kpi_id,
          relationship_type,
          formula
        )
      `)
      .eq('district_id', districtId)
      .order('display_order', { ascending: true });

    const { data: kpis, error: kpisError } = await query;
    if (kpisError) throw kpisError;

    // Get user preferences
    const { data: preferences, error: prefsError } = await supabase
      .from('user_kpi_preferences')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (prefsError) throw prefsError;

    // Apply user preferences to KPIs
    const kpisWithPreferences = kpis.map(kpi => {
      const pref = preferences?.find(p => p.kpi_id === kpi.id);
      return {
        ...kpi,
        is_hidden: pref?.is_hidden ?? kpi.is_hidden,
        display_order: pref?.display_order ?? kpi.display_order
      };
    });

    return kpisWithPreferences;
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    throw new Error(`Failed to fetch KPIs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function getUserKPIPreferences(userId: string): Promise<UserKPIPreference[]> {
  try {
    const { data, error } = await supabase
      .from('user_kpi_preferences')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch KPI preferences: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function updateUserKPIPreference(
  userId: string,
  kpiId: string,
  updates: Partial<UserKPIPreference>
) {
  try {
    const { data, error } = await supabase
      .from('user_kpi_preferences')
      .upsert({
        user_id: userId,
        kpi_id: kpiId,
        ...updates
      }, {
        onConflict: 'user_id,kpi_id'
      })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Failed to update KPI preference: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function updateUserKPIPreferenceBatch(
  userId: string,
  preferences: Array<{
    kpiId: string;
    isHidden?: boolean;
    displayOrder?: number;
  }>
) {
  try {
    const { data, error } = await supabase
      .from('user_kpi_preferences')
      .upsert(
        preferences.map(pref => ({
          user_id: userId,
          kpi_id: pref.kpiId,
          is_hidden: pref.isHidden,
          display_order: pref.displayOrder
        })),
        { onConflict: 'user_id,kpi_id' }
      )
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Failed to update KPI preferences: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Function to update KPI batch
export async function updateKPIBatch(kpis: KPI[]) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    return updateUserKPIPreferenceBatch(
      user.id,
      kpis.map((kpi, index) => ({
        kpiId: kpi.id,
        isHidden: kpi.is_hidden,
        displayOrder: kpi.display_order
      }))
    );
  } catch (error) {
    throw new Error(`Failed to update KPIs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getKPIValues(
  kpiId: string,
  startDate: Date,
  endDate: Date,
  schoolId?: string
) {
  try {
    const query = supabase
      .from('kpi_values')
      .select('*')
      .eq('kpi_id', kpiId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    if (schoolId && schoolId !== 'district') {
      query.eq('school_id', schoolId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as KPIValue[];
  } catch (error) {
    throw new Error(`Failed to fetch KPI values: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Schools
export async function getSchools(districtId: string) {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('district_id', districtId)
      .order('name');

    if (error) throw error;
    return data as School[];
  } catch (error) {
    throw new Error(`Failed to fetch schools: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// School Performance Metrics
export async function getSchoolDailyMetrics(districtId: string, dateRange: { start: Date; end: Date }): Promise<SchoolMetrics[]> {
  try {
    console.log('Fetching metrics with params:', {
      districtId,
      startDate: dateRange.start.toISOString().split('T')[0],
      endDate: dateRange.end.toISOString().split('T')[0]
    });

    const { data, error } = await supabase
      .from('school_daily_metrics')
      .select(`
        id,
        school_id,
        date,
        total_enrollment,
        free_reduced_count,
        free_count,
        reduced_count,
        breakfast_count,
        lunch_count,
        snack_count,
        supper_count,
        free_meal_lunch,
        reduced_meal_lunch,
        paid_meal_lunch,
        free_meal_breakfast,
        reduced_meal_breakfast,
        paid_meal_breakfast,
        free_meal_snack,
        reduced_meal_snack,
        paid_meal_snack,
        free_meal_supper,
        reduced_meal_supper,
        paid_meal_supper,
        reimbursement_amount,
        alc_revenue,
        meal_equivalents,
        mplh,
        program_access_rate,
        breakfast_participation_rate,
        lunch_participation_rate,
        snack_participation_rate,
        supper_participation_rate,
        planned_meals,
        produced_meals,
        served_meals,
        schools (
          name
        )
      `)
      .eq('district_id', districtId)
      .gte('date', dateRange.start.toISOString().split('T')[0])
      .lte('date', dateRange.end.toISOString().split('T')[0])
      .order('school_id', { ascending: true })
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching school metrics:', error);
      throw error;
    }

    if (!data) return [];

    // Map the data to include school name and ensure all values are present
    const metrics = data.map(metric => ({
      id: metric.id,
      school_id: metric.school_id,
      school_name: metric.schools?.name || 'Unknown School',
      date: metric.date,
      total_enrollment: metric.total_enrollment || 0,
      free_reduced_count: metric.free_reduced_count || 0,
      free_count: metric.free_count || 0,
      reduced_count: metric.reduced_count || 0,
      program_access_rate: metric.program_access_rate || 0,
      breakfast_participation_rate: metric.breakfast_participation_rate || 0,
      lunch_participation_rate: metric.lunch_participation_rate || 0,
      snack_participation_rate: metric.snack_participation_rate || 0,
      supper_participation_rate: metric.supper_participation_rate || 0,
      breakfast_count: metric.breakfast_count || 0,
      lunch_count: metric.lunch_count || 0,
      snack_count: metric.snack_count || 0,
      supper_count: metric.supper_count || 0,
      free_meal_lunch: metric.free_meal_lunch || 0,
      reduced_meal_lunch: metric.reduced_meal_lunch || 0,
      paid_meal_lunch: metric.paid_meal_lunch || 0,
      free_meal_breakfast: metric.free_meal_breakfast || 0,
      reduced_meal_breakfast: metric.reduced_meal_breakfast || 0,
      paid_meal_breakfast: metric.paid_meal_breakfast || 0,
      free_meal_snack: metric.free_meal_snack || 0,
      reduced_meal_snack: metric.reduced_meal_snack || 0,
      paid_meal_snack: metric.paid_meal_snack || 0,
      free_meal_supper: metric.free_meal_supper || 0,
      reduced_meal_supper: metric.reduced_meal_supper || 0,
      paid_meal_supper: metric.paid_meal_supper || 0,
      reimbursement_amount: metric.reimbursement_amount || 0,
      alc_revenue: metric.alc_revenue || 0,
      meal_equivalents: metric.meal_equivalents || 0,
      mplh: metric.mplh || 0,
      planned_meals: metric.planned_meals || 0,
      produced_meals: metric.produced_meals || 0,
      served_meals: metric.served_meals || 0,
      eod_tasks_completed: true // Hardcode for now since we don't have the column yet
    }));

    // Remove duplicates by keeping only the latest record for each school/date combination
    const uniqueMetrics = metrics.reduce((acc, metric) => {
      const key = `${metric.school_id}-${metric.date}`;
      if (!acc[key] || new Date(metric.date) > new Date(acc[key].date)) {
        acc[key] = metric;
      }
      return acc;
    }, {} as Record<string, SchoolMetrics>);

    const dedupedMetrics = Object.values(uniqueMetrics);
    console.log('Processed metrics:', dedupedMetrics);
    return dedupedMetrics;
  } catch (error) {
    console.error('Error in getSchoolDailyMetrics:', error);
    throw new Error(`Failed to fetch school metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// School Benchmarks
export async function getSchoolBenchmarks(schoolId: string) {
  try {
    // Skip benchmark fetch for district view
    if (schoolId === 'district') {
      return [];
    }

    const { data, error } = await supabase
      .from('school_benchmarks')
      .select('*')
      .eq('school_id', schoolId);

    if (error) throw error;
    return data as SchoolBenchmark[];
  } catch (error) {
    throw new Error(`Failed to fetch school benchmarks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function updateSchoolBenchmark(
  schoolId: string,
  kpiId: string,
  benchmark: number
) {
  try {
    // Skip benchmark update for district view
    if (schoolId === 'district') {
      return null;
    }

    // First, update the specified KPI benchmark
    const { data: updatedBenchmark, error: benchmarkError } = await supabase
      .from('school_benchmarks')
      .upsert(
        {
          school_id: schoolId,
          kpi_id: kpiId,
          benchmark
        },
        {
          onConflict: 'school_id,kpi_id'
        }
      )
      .select()
      .single();

    if (benchmarkError) throw benchmarkError;

    // Check if this KPI drives other KPI benchmarks
    const { data: relationships, error: relError } = await supabase
      .from('kpi_relationships')
      .select(`
        target_kpi_id,
        formula,
        kpis!target_kpi_id(*)
      `)
      .eq('source_kpi_id', kpiId)
      .eq('relationship_type', 'drives_benchmark');

    if (relError) throw relError;

    // If there are relationships, update the driven KPIs
    if (relationships?.length) {
      // Get school enrollment
      const { data: school } = await supabase
        .from('school_daily_metrics')
        .select('total_enrollment')
        .eq('school_id', schoolId)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      const enrollment = school?.total_enrollment || 0;

      // Update each driven KPI
      for (const rel of relationships) {
        // For Meals Served, calculate based on participation rate
        if (rel.kpis.name === 'Meals') {
          const newBenchmark = Math.round(enrollment * (benchmark / 100));
          await supabase
            .from('school_benchmarks')
            .upsert({
              school_id: schoolId,
              kpi_id: rel.target_kpi_id,
              benchmark: newBenchmark
            }, {
              onConflict: 'school_id,kpi_id'
            });
        }
      }
    }

    return updatedBenchmark;
  } catch (error) {
    throw new Error(`Failed to update school benchmark: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function getDistrictBenchmarks(districtId: string) {
  try {
    const { data: schools } = await supabase
      .from('schools')
      .select('id')
      .eq('district_id', districtId);

    if (!schools?.length) return [];

    const schoolIds = schools.map(s => s.id);

    const { data: benchmarks, error } = await supabase
      .from('school_benchmarks')
      .select(`
        school_id,
        kpi_id,
        benchmark,
        schools (
          name,
          district_id
        )
      `)
      .in('school_id', schoolIds);

    if (error) throw error;
    return benchmarks;
  } catch (error) {
    throw new Error(`Failed to fetch district benchmarks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Quiz Attempts
export async function saveQuizAttempt(courseId: string, score: number, passed: boolean) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) throw new Error('No authenticated user');

    // Get user's district_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('district_id')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;
    if (!userData?.district_id) throw new Error('User district not found');

    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert([{
        user_id: user.id,
        course_id: courseId,
        score,
        passed,
        district_id: userData.district_id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Failed to save quiz attempt: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getQuizAttempts(courseId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // Get user's district_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('district_id')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;

    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch quiz attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Learning Courses
export async function createLearningCourse(courseData: {
  title: string;
  description?: string;
  thumbnail_url?: string;
  duration?: string;
  instructor_name: string;
  instructor_title?: string;
  instructor_avatar_url?: string;
  objectives?: string[];
  prerequisites?: string[];
  passing_score?: number;
  is_published?: boolean;
  modules?: Array<{
    moduleId: string;
    isRequired: boolean;
  }>;
  roles?: string[];
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // Get user's district_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('district_id')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;

    // Start a transaction by inserting the course first
    const { data: course, error } = await supabase
      .from('learning_courses')
      .insert({
        ...{...courseData, modules: undefined, roles: undefined},
        district_id: userData.district_id,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    // If modules are specified, create the module mappings
    if (courseData.modules?.length) {
      const { error: moduleError } = await supabase
        .from('sys_course_module_mapping')
        .insert(
          courseData.modules.map(m => ({
            course_id: course.id,
            module_id: m.moduleId,
            is_required: m.isRequired
          }))
        );
      
      if (moduleError) throw moduleError;
    }

    return course;
  } catch (error) {
    throw new Error(`Failed to create course: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateLearningCourse(courseId: string, updates: Partial<{
  title: string;
  description: string;
  thumbnail_url: string;
  duration: string;
  instructor_name: string;
  instructor_title: string;
  instructor_avatar_url: string;
  objectives: string[];
  prerequisites: string[];
  passing_score: number;
  is_published: boolean;
  sections: any[];
  resources: any[];
  questions: any[];
  modules?: Array<{
    moduleId: string;
    isRequired: boolean;
  }>;
  roles?: string[];
}>) {
  try {
    // Validate sections format if provided
    if (updates.sections) {
      updates.sections.forEach((section, index) => {
        if (!section.title || !Array.isArray(section.content)) {
          throw new Error(`Invalid section format at index ${index}`);
        }
      });
    }

    // Validate resources format if provided
    if (updates.resources) {
      updates.resources.forEach((resource, index) => {
        if (!resource.title || !resource.url || !resource.type) {
          throw new Error(`Invalid resource format at index ${index}`);
        }
      });
    }

    // Validate questions format if provided
    if (updates.questions) {
      updates.questions.forEach((question, index) => {
        if (!question.question || !Array.isArray(question.options) || question.correct_answer === undefined) {
          throw new Error(`Invalid question format at index ${index}`);
        }
      });
    }

    // Separate modules from other updates
    const { modules, ...courseUpdates } = updates;
    
    // Update the course
    const { data: course, error: courseError } = await supabase
      .from('learning_courses')
      .update(courseUpdates)
      .eq('id', courseId)
      .select()
      .single();

    if (courseError) throw courseError;

    // If modules are specified, update the module mappings
    if (modules) {
      // First delete existing mappings
      const { error: deleteError } = await supabase
        .from('sys_course_module_mapping')
        .delete()
        .eq('course_id', courseId);
      
      if (deleteError) throw deleteError;

      // Then insert new mappings if any are provided
      if (modules.length > 0) {
        const { error: moduleError } = await supabase
          .from('sys_course_module_mapping')
          .insert(
            modules.map(m => ({
              course_id: courseId,
              module_id: m.moduleId,
              is_required: m.isRequired
            }))
          );
        
        if (moduleError) throw moduleError;
      }
    }

    return course;
  } catch (error) {
    throw new Error(`Failed to update course: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getLearningCourses() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // Get all courses with their quiz attempts
    const { data, error } = await supabase
      .from('learning_courses')
      .select(`
        *,
        sections,
        resources,
        questions,
        sys_course_module_mapping (
          module_id,
          is_required,
          sys_modules (
            id,
            name,
            description,
            sys_platforms (
              name
            )
          )
        ),
        quiz_attempts(
          score,
          passed,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Get recommended courses for the user
    const { data: recommendedCourses } = await supabase
      .rpc('get_recommended_courses', { p_user_id: user.id });
    
    // Map the data to include quiz attempts and recommendations
    return data.map(course => ({
      ...course,
      isRequired: recommendedCourses?.some((rc: any) => rc.course_id === course.id && rc.is_required),
      quizAttempts: course.quiz_attempts || []
    }));
  } catch (error) {
    throw new Error(`Failed to fetch courses: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get available roles
export async function getRoles() {
  try {
    const { data, error } = await supabase
      .from('sys_roles')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch roles: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get available modules
export async function getModules() {
  try {
    const { data, error } = await supabase
      .from('sys_modules')
      .select(`
        *,
        sys_platforms (
          name,
          description
        )
      `)
      .order('name');

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch modules: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get course modules
async function getCourseModules(courseId: string) {
  try {
    const { data, error } = await supabase
      .from('sys_course_module_mapping')
      .select(`
        *,
        sys_modules (
          id,
          name,
          description,
          sys_platforms (
            name
          )
        )
      `)
      .eq('course_id', courseId);

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch course modules: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}