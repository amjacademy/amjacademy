const { supabase } = require("../config/supabaseClient");

async function getEnrollments() {
  const { data, error } = await supabase.from("enrollments").select("*");
  return { data, error };
}

async function createEnrollment(enrollment) {
  const cleanEnrollment = {
    ...enrollment,
    image: enrollment.image || null, // Default to null if missing
  };

  const { data, error } = await supabase
    .from("enrollments")
    .insert([cleanEnrollment])
    .select();

  return { data, error };
}


async function deleteEnrollment(id) {
  const { data, error } = await supabase
    .from("enrollments")
    .delete()
    .eq("id", id);
  return { data, error };
}

async function updateEnrollment(id, updates) {
  const { data, error } = await supabase
    .from("enrollments")
    .update(updates)
    .eq("id", id)
    .select();
  return { data, error };
}

module.exports = { getEnrollments, createEnrollment, deleteEnrollment, updateEnrollment };
