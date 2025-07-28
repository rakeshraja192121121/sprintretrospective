// app/api/dataa/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import VersionHistory from "@/models/version";

// POST: Save new version entry (still requires all fields for new entries)
export async function POST(request) {
  try {
    await connectMongoDB();
    const newData = await request.json();

    const { date, name, update } = newData;

    // Keep validation for new entries: All fields must be present and non-empty
    if (!date || !name || !update) {
      return NextResponse.json(
        { msg: "All fields are required (date, name, update) for new entries" },
        { status: 400 }
      );
    }

    await VersionHistory.create({
      date,
      name,
      update,
    });

    return NextResponse.json(
      { msg: "Data added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in /api/dataa POST handler:", error);
    if (error.name === "ValidationError") {
      const errors = Object.keys(error.errors).map((key) => ({
        field: key,
        message: error.errors[key].message,
      }));
      return NextResponse.json(
        {
          msg: "Validation Error",
          details: errors,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { msg: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// GET: Fetch all version entries
export async function GET(request) {
  try {
    await connectMongoDB();
    const data = await VersionHistory.find();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in /api/dataa GET handler:", error);
    return NextResponse.json(
      { msg: "Failed to fetch data", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete version history by ID
export async function DELETE(request) {
  try {
    await connectMongoDB();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { msg: "ID is required for deletion" },
        { status: 400 }
      );
    }

    const result = await VersionHistory.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ msg: "Data not found" }, { status: 404 });
    }
    return NextResponse.json({ msg: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/dataa DELETE handler:", error);
    return NextResponse.json(
      { msg: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update version history by ID (now allows empty fields)
export async function PUT(request) {
  try {
    await connectMongoDB();
    // Destructure all potential fields from the request body.
    // If a field is not sent in the body, it will be `undefined`.
    // If a field is sent as an empty string, it will be `""`.
    const { id, date, name, update } = await request.json();

    if (!id) {
      // Only check for the ID, as other fields are now allowed to be empty or missing
      return NextResponse.json(
        { msg: "ID is required for update" },
        { status: 400 }
      );
    }

    // Construct an update object containing only the fields that were explicitly provided
    // in the request body. This ensures that if a field is *not* sent, it's not updated,
    // and if it's sent as an empty string, it *is* updated to an empty string.
    const updateFields = {};
    if (date !== undefined) updateFields.date = date;
    if (name !== undefined) updateFields.name = name;
    if (update !== undefined) updateFields.update = update;

    // Use findByIdAndUpdate to update the document.
    // { new: true } returns the updated document.
    // { runValidators: true } will run schema validators, but since 'required' is removed,
    // empty strings will pass validation.
    const result = await VersionHistory.findByIdAndUpdate(
      id,
      updateFields, // Pass only the fields that were provided in the request
      { new: true, runValidators: true }
    );

    if (!result) {
      return NextResponse.json({ msg: "Data not found" }, { status: 404 });
    }
    return NextResponse.json(
      { msg: "Updated successfully", data: result },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/dataa PUT handler:", error);
    // If there's a Mongoose validation error (e.g., wrong type), handle it
    if (error.name === "ValidationError") {
      const errors = Object.keys(error.errors).map((key) => ({
        field: key,
        message: error.errors[key].message,
      }));
      return NextResponse.json(
        {
          msg: "Validation Error",
          details: errors,
        },
        { status: 400 }
      );
    }
    // Generic server error
    return NextResponse.json(
      { msg: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
