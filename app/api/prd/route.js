import connectMongoDB from "../../../lib/mongodb";
import workspaceModel from "../../../models/workspace";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongoDB();

    const cards = await workspaceModel.find({}).lean();

    // Map _id to id string for frontend
    const mappedCards = cards.map(({ _id, title }) => ({
      id: _id.toString(),
      title,
    }));

    return NextResponse.json(mappedCards);
  } catch (error) {
    console.error("GET /api/prd error:", error);
    return NextResponse.json(
      { message: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectMongoDB();

    const { title } = await req.json();

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { message: "Invalid data: 'title' is required and must be a string." },
        { status: 400 }
      );
    }

    const newCard = new workspaceModel({ title: title.trim() });
    const savedCard = await newCard.save();

    return NextResponse.json(
      {
        message: "Card created",
        card: { id: savedCard._id.toString(), title: savedCard.title },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/prd error:", error);
    return NextResponse.json(
      { message: "Error creating card" },
      { status: 500 }
    );
  }
}
