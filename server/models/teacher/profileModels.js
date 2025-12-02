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
  // 1️⃣ Get all assessment_target IDs where the user is the receiver
  const { data: targets, error: targetErr } = await supabase
    .from("assessment_targets")
    .select("id")
    .eq("receiver_id", userId);

  if (targetErr) throw targetErr;

  if (!targets || targets.length === 0) {
    return []; // no assessments exist
  }

  const targetIds = targets.map(t => t.id);

  // 2️⃣ Fetch all responses where assessment_target_id matches
  const { data: responses, error: respErr } = await supabase
    .from("assessment_responses")
    .select("user_count")
    .in("assessment_target_id", targetIds);

  if (respErr) throw respErr;

  return responses;
};
