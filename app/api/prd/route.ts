import connectMongoDB from "../../../lib/mongodb";
import workspaceModel from "../../../models/workspace";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongoDB();

    const cards = await workspaceModel
      .find()
      .sort({ createdAt: -1 })
      .select("title status createdAt");
    // .lean();

    const mappedCards = cards.map(({ _id, title, status, createdAt }) => ({
      id: _id.toString(),
      title,
      status,
      createdAt,
    }));

    return NextResponse.json(mappedCards, { status: 200 });
  } catch (error) {
    console.error("GET /api/prd error:", error);
    return NextResponse.json(
      { message: "Failed to fetch cards", error: error.message },
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
        { message: "'title' is required and must be a string" },
        { status: 400 }
      );
    }

    const newCard = await workspaceModel.create({
      title: title.trim(),
      status: "new",
    });

    return NextResponse.json(
      {
        message: "Card created",
        card: {
          id: newCard._id.toString(),
          title: newCard.title,
          status: newCard.status,
          createdAt: newCard.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/prd error:", error);
    return NextResponse.json(
      { message: "Error creating card", error: error.message },
      { status: 500 }
    );
  }
}
