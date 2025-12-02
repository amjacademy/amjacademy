// profileModels.js
const{ supabase }=require("../../config/supabaseClient.js");

// ---------------------- GET USER BASIC DETAILS ----------------------
exports.getUserById = async (userId) => {
  return await supabase
    .from("users")
    .select("id, name, email, username")
    .eq("id", userId)
    .maybeSingle();
};

// ---------------------- GET Teacher DETAILS ----------------------
exports.getTeacherById = async (userId) => {
  return await supabase
    .from("teachers")
    .select(
      "profile,profession,salary"
    )
    .eq("id", userId)
    .maybeSingle();
};

// ---------------------- GET USER MEDIA ----------------------
exports.getMediaByUserId = async (userId) => {
  return await supabase
    .from("media")
    .select("resource_type, secure_url, original_filename")
    .eq("user_id", userId);
};

// ---------------------- INSERT MEDIA ----------------------
exports.insertMedia = async (payload) => {
  return await supabase
    .from("media")
    .insert([payload])
    .select()
    .single();
};

// ---------------------- UPDATE PROFILE AVATAR ----------------------
exports.updateAvatar = async (userId, avatarUrl) => {
  return await supabase
    .from("teachers")
    .update({ profile: avatarUrl })
    .eq("id", userId)
    .select()
    .single();
};

// ---------------------- GET MEDIA (LIST) ----------------------
exports.getMediaList = async (userId) => {
  return await supabase
    .from("media")
    .select("resource_type, secure_url, original_filename")
    .eq("user_id", userId)
    .order("uploaded_at", { ascending: false });
};

// ---------------------- GET USER ASSESSMENT RESPONSES ----------------------
exports.getAssessmentResponsesByUserId = async (userId) => {
  return await supabase
    .from("assessment_responses")
    .select("user_count")
    .eq("user_id", userId);
};
