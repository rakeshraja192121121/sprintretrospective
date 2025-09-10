export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import RCADetails from "../../../models/RcaDetails";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const cardID = searchParams.get("cardID");

    if (cardID) {
      const rcaDetails = await RCADetails.findOne({ cardID });
      return NextResponse.json(rcaDetails || {});
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    const rcaDetails = new RCADetails(data);
    const savedRcaDetails = await rcaDetails.save();
    return NextResponse.json(savedRcaDetails, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const data = await request.json();
    const { cardID, ...updateData } = data;

    const updatedRcaDetails = await RCADetails.findOneAndUpdate(
      { cardID },
      updateData,
      { new: true, upsert: true }
    );

    return NextResponse.json(updatedRcaDetails);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
