import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Data from "@/models/data";

// DELETE method
export async function DELETE(request, context) {
  try {
    const { id } = (await context?.params) || {}; // Safe access
    if (!id) throw new Error("ID param missing");

    await connectMongoDB();
    await Data.findByIdAndDelete(id);

    return NextResponse.json({ message: "Item deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH method
export async function PATCH(request, { params }) {
  const { id } = (await params) || {};
  const { description } = await request.json();
  await connectMongoDB();
  const updatedItem = await Data.findByIdAndUpdate(
    id,
    { description },
    { new: true }
  );
  return NextResponse.json(
    { message: "Updated successfully", updatedItem },
    { status: 200 }
  );
}
