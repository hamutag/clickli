import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const requests = await prisma.dealRequest.findMany({
      orderBy: [{ createdAt: "desc" }],
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Failed to fetch deal requests:", error);
    return NextResponse.json(
      { error: "שגיאה בטעינת הבקשות" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, adminNote } = body;

    if (!id) {
      return NextResponse.json(
        { error: "חסר מזהה בקשה" },
        { status: 400 }
      );
    }

    const validStatuses = ["OPEN", "IN_PROGRESS", "FULFILLED", "CLOSED"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "סטטוס לא חוקי" },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (adminNote !== undefined) data.adminNote = adminNote;

    const updated = await prisma.dealRequest.update({
      where: { id },
      data,
    });

    return NextResponse.json({ request: updated });
  } catch (error) {
    console.error("Failed to update deal request:", error);
    return NextResponse.json(
      { error: "שגיאה בעדכון הבקשה" },
      { status: 500 }
    );
  }
}
