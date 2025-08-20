export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import VersionHistory from "@/models/version";
import CombinedAppData from "@/models/CombinedSave";
import { NextResponse } from "next/server";

export async function POST() {
  await dbConnect();

  try {
    const versionHistory = await VersionHistory.find();

    const combinedData = {
      versionHistoryTable: versionHistory.map((item) => ({
        date: item.date,
        name: item.name,
        update: item.update,
      })),
    };

    const saved = await CombinedAppData.create(combinedData);

    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    console.error("Error saving combined data:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
