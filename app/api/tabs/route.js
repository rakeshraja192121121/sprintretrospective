export const dynamic = "force-dynamic";
import connectMongoDB from "../../../lib/mongodb";
import Tab from "@/models/Tab";
import { validateInput, sanitizeInput, validateObjectId } from "../../../lib/validation";

export async function GET(request) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId || !validateObjectId(projectId)) {
      return new Response(JSON.stringify({ error: "Invalid or missing projectId" }), {
        status: 400,
      });
    }

    const tabs = await Tab.find({ projectId }).lean();

    return new Response(JSON.stringify({ success: true, data: tabs }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to fetch tabs" }), {
      status: 500,
    });
  }
}

export async function POST(request) {
  try {
    await connectMongoDB();

    const body = await request.json();

    // Validate required fields
    const validation = validateInput(body, ['projectId', 'label', 'path']);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400 }
      );
    }

    // Sanitize inputs
    body.label = sanitizeInput(body.label);
    body.path = sanitizeInput(body.path);

    const newTab = new Tab(body);
    await newTab.save();

    return new Response(JSON.stringify({ success: true, data: newTab }), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to create tab" }), {
      status: 500,
    });
  }
}
