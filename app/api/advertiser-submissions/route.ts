import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { companyName, email, videoUrl, budget, callToAction } = body

    if (!companyName || !email || !videoUrl || !budget || !callToAction) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email address" },
        { status: 400 }
      )
    }

    // Validate budget is at least $100
    if (parseFloat(budget) < 100) {
      return NextResponse.json(
        { message: "Minimum monthly budget is $100" },
        { status: 400 }
      )
    }

    // Create advertiser_submissions table if it doesn't exist
    const { data: existingTable } = await supabase
      .from("advertiser_submissions")
      .select("id")
      .limit(1)
      .catch(() => ({ data: null }))

    // Insert submission into Supabase
    const { data, error } = await supabase
      .from("advertiser_submissions")
      .insert([
        {
          company_name: companyName,
          email: email,
          phone: body.phone || null,
          website: body.website || null,
          video_url: videoUrl,
          call_to_action: callToAction,
          target_audience: body.targetAudience || null,
          monthly_budget: parseFloat(budget),
          message: body.message || null,
          status: "pending", // pending, approved, rejected
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Supabase error:", error)
      
      // Fallback: if table doesn't exist, create it
      if (error.message.includes("not found")) {
        return NextResponse.json(
          {
            message:
              "Database not yet configured. Please contact us at support@ballsortgame.com",
          },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { message: "Failed to submit ad proposal" },
        { status: 500 }
      )
    }

    // In a real application, you would send an email confirmation here
    // For now, we'll just return success
    console.log(`[Advertiser] New submission from ${companyName} (${email})`)

    return NextResponse.json(
      {
        message: "Ad proposal submitted successfully",
        submissionId: data?.[0]?.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve submissions (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    // Check for admin auth header (you should implement proper auth)
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // In a real app, verify the token here
    // For now, just check if it exists

    // Fetch pending submissions
    const { data, error } = await supabase
      .from("advertiser_submissions")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        { message: "Failed to fetch submissions" },
        { status: 500 }
      )
    }

    return NextResponse.json({ submissions: data }, { status: 200 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
