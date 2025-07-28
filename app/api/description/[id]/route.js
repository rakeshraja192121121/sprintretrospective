import connectMongoDB from "@/lib/mongodb";
import Description from "@/models/Description";
import { NextResponse } from "next/server";

// PATCH /api/description/[id]
export async function PATCH(req, { params }) {
  try {
    await connectMongoDB();
    const { id } = params;
    const { content } = await req.json();

    const updated = await Description.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (err) {
    console.error("PATCH error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update" },
      { status: 500 }
    );
  }
}

// DELETE /api/description/[id]
export async function DELETE(_, { params }) {
  try {
    await connectMongoDB();
    const { id } = params;

    const deleted = await Description.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete" },
      { status: 500 }
    );
  }
}
