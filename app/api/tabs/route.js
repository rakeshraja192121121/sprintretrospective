import connectMongoDB from "../../../lib/mongodb";
import Tab from "@/models/Tab";

export async function GET(request) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return new Response(JSON.stringify({ error: "Missing projectId" }), {
        status: 400,
      });
    }

    const tabs = await Tab.find({ projectId }).lean();

    return new Response(JSON.stringify(tabs), { status: 200 });
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

    // Validate required fields before saving
    if (!body.projectId || !body.label || !body.path) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const newTab = new Tab(body);
    await newTab.save();

    return new Response(JSON.stringify(newTab), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to create tab" }), {
      status: 500,
    });
  }
}
