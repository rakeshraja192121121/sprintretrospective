export const dynamic = "force-dynamic";
import connectMongoDB from "../../../../lib/mongodb";
import Workspace from "../../../../models/workspace";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// export async function DELETE(req, { params }) {
//   try {
//     const { id } = await params;

//     if (!ObjectId.isValid(id)) {
//       return NextResponse.json(
//         { message: "Invalid id format" },
//         { status: 400 }
//       );
//     }

//     await connectMongoDB();

//     const result = await Workspace.findByIdAndDelete(id);

//     if (!result) {
//       return NextResponse.json({ message: "Card not found" }, { status: 404 });
//     }

//     return NextResponse.json({ message: "Card deleted", id });
//   } catch (error) {
//     console.error("DELETE /api/prd/[id] error:", error);
//     return NextResponse.json(
//       { message: "Error deleting card" },
//       { status: 500 }
//     );
//   }
// }

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid id format" },
        { status: 400 }
      );
    }

    const updates = await req.json();

    if (updates.title !== undefined && typeof updates.title !== "string") {
      return NextResponse.json(
        { message: "'title' must be a string if provided." },
        { status: 400 }
      );
    }

    if (updates.status !== undefined && typeof updates.status !== "string") {
      return NextResponse.json(
        { message: "'status' must be a string if provided." },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const updatedCard = await Workspace.findByIdAndUpdate(
      id,
      { title: updates.title?.trim(), status: updates.status },
      { new: true }
    );

    if (!updatedCard) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Card updated",
      card: {
        id: updatedCard._id.toString(),
        title: updatedCard.title,
        status: updatedCard.status,
      },
    });
  } catch (error) {
    console.error("PATCH /api/prd/[id] error:", error);
    return NextResponse.json(
      { message: "Error updating card" },
      { status: 500 }
    );
  }
}
