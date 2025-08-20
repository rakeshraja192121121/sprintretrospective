export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Data from "@/models/data";

export async function POST(request) {
  try {
    const { description, type } = await request.json();
    if (!description || !type) {
      return NextResponse.json(
        { message: "Description and Type are required" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const newItem = await Data.create({ description, type });

    return NextResponse.json(
      { message: "Topic Created", item: newItem },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectMongoDB();

    const data = await Data.find();

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
