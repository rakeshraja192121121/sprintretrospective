import connectDB from "@/lib/mongodb"; // your DB connection helper
import RCAcard from "@/models/RCAcardSchema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const cards = await RCAcard.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(cards);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.title || !body.epicName) {
      return NextResponse.json(
        { error: "epicName and title are required" },
        { status: 400 }
      );
    }
    await connectDB();
    const newCard = new RCAcard({
      epicName: body.epicName,
      title: body.title,
      details: {}, // initializes empty details
    });
    await newCard.save();
    return NextResponse.json(newCard, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const { epicName, title } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    if (!epicName || !title) {
      return NextResponse.json(
        { error: "Epic Name and Title are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const updatedCard = await RCAcard.findByIdAndUpdate(
      id,
      { epicName, title },
      { new: true }
    );

    if (!updatedCard) {
      return NextResponse.json(
        { error: "Card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCard, { status: 200 });
  } catch (error) {
    console.error("Error updating RCA card:", error);
    return NextResponse.json(
      { error: "Failed to update card" },
      { status: 500 }
    );
  }
}
