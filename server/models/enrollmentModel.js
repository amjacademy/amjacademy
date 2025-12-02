const { supabase } = require("../config/supabaseClient");

async function getEnrollments() {
  try {
    // Fetch from all tables
    const { data: users, error: userError } = await supabase.from("users").select("*");
    if (userError) throw userError;

    const { data: students, error: studentError } = await supabase.from("students").select("*");
    if (studentError) throw studentError;

    const { data: teachers, error: teacherError } = await supabase.from("teachers").select("*");
    if (teacherError) throw teacherError;

    // Merge users with their specific table
    const mergedData = users.map((user) => {
      const role = user.role?.toLowerCase();
      if (role === "student") {
        const student = students.find((s) => s.id === user.id);
        return {
          ...user,
          image: student?.profile || null,
          batchtype: student?.batch_type || null,
          plan: student?.plan || null,
          level: student?.level || null,
        };
      } else if (role === "teacher") {
        const teacher = teachers.find((t) => t.id === user.id);
        return {
          ...user,
          experiencelevel: teacher?.exp_lvl || null,
          image: teacher?.profile || null,
          salary: teacher?.salary || 0
        };
      }
      return user;
    });

    return { data: mergedData, error: null };
  } catch (err) {
    console.error("Error fetching enrollments:", err);
    return { data: null, error: err };
  }
}

async function createUser(userPayload) {
  try {
    const {
      id,
      role,
      name,
      age,
      profession,
      phone,
      email,
      additionalEmail,
      image,
      password,
      username,
      batchtype,
      plan,
      level,
      experiencelevel,
      salary
    } = userPayload;

    // Insert into users
    const cleanUser = {
      id,
      role: role.toLowerCase(),
      name,
      age,
      profession,
      phone_number: phone || null,
      email,
      additional_email: additionalEmail || null,
      username,
      password,
    };

    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([cleanUser])
      .select();

    if (userError) throw userError;

    // Insert into role-specific table
    if (role.toLowerCase() === "student") {
      const studentData = {
        id,
        batch_type: batchtype || null,
        plan: plan || null,
        level: level || null,
        profile: image || null,
        total_attended_classes: 0,
        progress: 0,
        achievements: null,
        enrolled_subjects: null,
        name,
        profession: profession || null,
      };
      const { error: studentError } = await supabase.from("students").insert([studentData]);
      if (studentError) throw studentError;
    }

   if (role.toLowerCase() === "teacher") {
  const teacherData = { 
    id,
    name, 
    exp_lvl: experiencelevel || null,
    profile: image || null, // ✅ FIXED: Store profile image link for teachers
    profession: profession || null,
    salary: salary || 0,
  };
  const { error: teacherError } = await supabase.from("teachers").insert([teacherData]);
  if (teacherError) throw teacherError;
}


    return { success: true, message: "User created successfully", user: userData?.[0] || null };
  } catch (err) {
    console.error("❌ Error creating user:", err);
    return { success: false, message: err.message };
  }
}

async function deleteEnrollment(id) {
  try {
    // Delete from specific subtable first
    await supabase.from("students").delete().eq("id", id);
    await supabase.from("teachers").delete().eq("id", id);
    // Then delete from main users table
    const { data, error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error("Error deleting enrollment:", err);
    return { data: null, error: err };
  }
}

async function updateEnrollment(id, updates) {
  try {
    const role = updates.role?.toLowerCase();

    // --- 1️⃣ Update common fields in users table ---
    const userUpdates = {
      name: updates.name,
      age: updates.age,
      profession: updates.profession,
      phone_number: updates.phone,
      email: updates.email,
      additional_email: updates.additionalEmail,
      username: updates.username,
      password: updates.password,
      role, // ensure role stays lowercase
      salary: updates.salary || 0,
    };

    const { data: userData, error: userError } = await supabase
      .from("users")
      .update(userUpdates)
      .eq("id", id)
      .select();

    if (userError) throw userError;

    // --- 2️⃣ Update student or teacher-specific table ---
    if (role === "student") {
      const studentUpdates = {
        batch_type: updates.batchtype,
        plan: updates.plan,
        level: updates.level,
        profile: updates.image,
      };

      const { error: studentError } = await supabase
        .from("students")
        .update(studentUpdates)
        .eq("id", id);

      if (studentError) throw studentError;
    }

    if (role === "teacher") {
     const teacherUpdates = {
    exp_lvl: updates.experiencelevel,
    profile: updates.image || null, // ✅ add this line
    salary: updates.salary || 0,
  };

      const { error: teacherError } = await supabase
        .from("teachers")
        .update(teacherUpdates)
        .eq("id", id);

      if (teacherError) throw teacherError;
    }

    // --- 3️⃣ Return updated merged data ---
    return {
      success: true,
      message: "User updated successfully",
      data: userData?.[0] || null,
    };
  } catch (err) {
    console.error("❌ Error updating enrollment:", err);
    return { success: false, message: err.message, data: null };
  }
}

async function getEnrollmentById(id) {
  try {
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", id).single();
    if (userError) throw userError;

    const role = user.role?.toLowerCase();
    let extraData = {};

    if (role === "student") {
      const { data: student, error: sErr } = await supabase.from("students").select("*").eq("id", id).single();
      if (sErr) throw sErr;
      extraData = {
        image: student?.profile || null,
        batchtype: student?.batch_type || null,
        plan: student?.plan || null,
        level: student?.level || null,
      };
    } else if (role === "teacher") {
      const { data: teacher, error: tErr } = await supabase.from("teachers").select("*").eq("id", id).single();
      if (tErr) throw tErr;
      extraData = {
        experiencelevel: teacher?.exp_lvl || null,
        image: teacher?.profile || null,
        salary: teacher?.salary || 0,
      };
    }

    return { data: { ...user, ...extraData }, error: null };
  } catch (err) {
    console.error("Error fetching enrollment by ID:", err);
    return { data: null, error: err };
  }
}

module.exports = {
  getEnrollments,
  getEnrollmentById,
  createUser,
  deleteEnrollment,
  updateEnrollment,
};
