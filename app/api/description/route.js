import connectMongoDB from "@/lib/mongodb";
import Description from "@/models/Description";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    await connectMongoDB();

    // Parse JSON body containing content and userID
    const { content, userID } = await req.json();

    // Validate required fields
    if (!content || !content.trim() || !userID) {
      return NextResponse.json(
        { success: false, error: "Content and userID are required" },
        { status: 400 }
      );
    }

    // Create and save new description document
    const saved = await Description.create({ content, userID });

    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save description" },
      { status: 500 }
    );
  }
}
// GET handler - fetch all descriptions, no filtering
export async function GET(request) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const userID = searchParams.get("userID");
    const validUserId = new mongoose.Types.ObjectId(userID);
    const all = await Description.find({ userID: validUserId }).lean();

    return NextResponse.json({ success: true, data: all }, { status: 200 });
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch" },
      { status: 500 }
    );
  }
}
