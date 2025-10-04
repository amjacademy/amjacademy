
const express = require("express");
const { supabase } = require("../config/supabaseClient");
const router = express.Router();

// CREATE arrangement
router.post("/create", async (req, res) => {
  try {
    const { batch_type, student1_id, student2_id, teacher_id, day, date, time, link } = req.body;

    const { data, error } = await supabase
      .from("arrangements")
      .insert([
        {
          batch_type,
          student1_id,
          student2_id: batch_type === "dual" ? student2_id : null,
          teacher_id,
          day,
          date,
          time,
          link
        }
      ])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET all arrangements
router.get("/getdetails", async (req, res) => {
  const { data, error } = await supabase.from("arrangements").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// UPDATE arrangement
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { batch_type, student1_id, student2_id, teacher_id, day, date, time, link } = req.body;

    const { data, error } = await supabase
      .from("arrangements")
      .update({
        batch_type,
        student1_id,
        student2_id: batch_type === "dual" ? student2_id : null,
        teacher_id,
        day,
        date,
        time,
        link
      })
      .eq("id", id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE arrangement
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("arrangements").delete().eq("id", id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

// GET /api/users
router.get("/fetchusers", async (req, res) => {
  try {
    // Fetch Students
   // Fetch Students (exclude password, phoneNumber, age)
const { data: students, error: studentError } = await supabase
  .from("enrollments")
  .select("id, name, batchtype")
  .eq("role", "Student");

if (studentError) return res.status(500).json({ error: studentError.message });

// Fetch Teachers (exclude password, phoneNumber, age)
const { data: teachers, error: teacherError } = await supabase
  .from("enrollments")
  .select("id, name")  // teachers may not have batchType
  .eq("role", "Teacher");

if (teacherError) return res.status(500).json({ error: teacherError.message });


    // Send both lists
    res.json({ students, teachers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;