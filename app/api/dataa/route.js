// app/api/dataa/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import VersionHistory from "@/models/version";
import mongoose from "mongoose";

export async function POST(request) {
  try {
    await connectMongoDB();
    const newData = await request.json();

    const { workspaceId, date, name, update } = newData;

    if (!workspaceId || !date || !name || !update) {
      return NextResponse.json(
        { msg: "All fields are required (date, name, update) for new entries" },
        { status: 400 }
      );
    }

    await VersionHistory.create({
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
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
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  await connectMongoDB();

  const validWorkspaceId = new mongoose.Types.ObjectId(workspaceId);

  const data = await VersionHistory.find({ workspaceId: validWorkspaceId });

  return NextResponse.json(data, { status: 200 });
}

// DELETE: Delete version history by ID
export async function DELETE(request) {
  try {
    await connectMongoDB();

    // Get the id from query params instead of body
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Missing ID" }, { status: 400 });
    }

    await VersionHistory.findByIdAndDelete(id);
    return NextResponse.json(
      { message: "Entry deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting entry:", error);
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}
// PUT: Update version history by ID (now allows empty fields)
export async function PUT(request) {
  try {
    await connectMongoDB();

    const { _id, date, name, update } = await request.json();

    if (!_id) {
      // Only check for the ID, as other fields are now allowed to be empty or missing
      return NextResponse.json(
        { msg: "ID is required for update" },
        { status: 400 }
      );
    }

    const updateFields = {};
    if (date !== undefined) updateFields.date = date;
    if (name !== undefined) updateFields.name = name;
    if (update !== undefined) updateFields.update = update;

    // Use findByIdAndUpdate to update the document.
    // { new: true } returns the updated document.
    // { runValidators: true } will run schema validators, but since 'required' is removed,
    // empty strings will pass validation.
    const result = await VersionHistory.findByIdAndUpdate(
      _id,
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
