import { NextResponse } from "next/server";
import { recordConversion } from "@/lib/tracking";

// POST /api/webhooks/conversion - קבלת postback מאפילייט
export async function POST(request: Request) {
  const body = await request.json();

  const {
    sub_id,
    order_id,
    order_amount,
    commission,
    currency,
    store_id,
  } = body;

  if (!sub_id || !order_amount || !commission || !store_id) {
    return NextResponse.json(
      { error: "Missing required fields: sub_id, order_amount, commission, store_id" },
      { status: 400 }
    );
  }

  const conversion = await recordConversion({
    subId: sub_id,
    orderId: order_id,
    orderAmount: parseFloat(order_amount),
    commission: parseFloat(commission),
    currency: currency || "USD",
    storeId: store_id,
  });

  if (!conversion) {
    return NextResponse.json(
      { error: "Click not found for sub_id" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, conversionId: conversion.id });
}

// GET - for affiliate networks that use GET postbacks
export async function GET(request: Request) {
  const url = new URL(request.url);

  const sub_id = url.searchParams.get("sub_id") || url.searchParams.get("aff_sub");
  const order_amount = url.searchParams.get("amount") || url.searchParams.get("order_amount");
  const commission = url.searchParams.get("commission") || url.searchParams.get("payout");
  const store_id = url.searchParams.get("store_id") || url.searchParams.get("advertiser_id");
  const order_id = url.searchParams.get("order_id") || url.searchParams.get("transaction_id");

  if (!sub_id || !order_amount || !commission || !store_id) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const conversion = await recordConversion({
    subId: sub_id,
    orderId: order_id || undefined,
    orderAmount: parseFloat(order_amount),
    commission: parseFloat(commission),
    storeId: store_id,
  });

  return NextResponse.json({
    success: !!conversion,
    conversionId: conversion?.id,
  });
}
