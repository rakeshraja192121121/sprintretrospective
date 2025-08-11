import connectMongoDB from "@/lib/mongodb";
import Description from "@/models/Description";
import { NextResponse } from "next/server";

// POST handler - create a new description
export async function POST(req) {
  try {
    await connectMongoDB();
    const { content, userId } = await req.json();

    if (!content || content.trim() === "" || !userId) {
      return NextResponse.json(
        { success: false, error: "Content and userId are required" },
        { status: 400 }
      );
    }

    const createdAt = new Date().toISOString();
    const saved = await Description.create({ content, userId, createdAt });

    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save" },
      { status: 500 }
    );
  }
}

// GET handler - fetch all descriptions, no filtering
export async function GET() {
  try {
    await connectMongoDB();

    const all = await Description.find().lean();

    return NextResponse.json({ success: true, data: all }, { status: 200 });
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch" },
      { status: 500 }
    );
  }
}
