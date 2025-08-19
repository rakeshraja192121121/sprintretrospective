import connectMongoDB from "../../../lib/mongodb";
import workspaceModel from "../../../models/workspace";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const username = url.searchParams.get("username"); // get username query param

    await connectMongoDB();

    const query = username ? { username } : {};
    const cards = await workspaceModel
      .find(query)
      .sort({ createdAt: -1 })
      .select("title status createdAt");

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

    const { title, username } = await req.json();

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { message: "'title' is required and must be a string" },
        { status: 400 }
      );
    }

    const newCard = await workspaceModel.create({
      userId: new mongoose.Types.ObjectId(),
      title: title.trim(),
      status: "new",
      username,
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
