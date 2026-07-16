import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateShortId } from "@/lib/utils";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    let role = (formData.get("role") as string) || "detail";

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }
    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json(
        { error: `허용되지 않는 파일 형식입니다: ${file.type}` },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "파일 크기는 10MB 이하여야 합니다." },
        { status: 400 }
      );
    }

    // GIF 파일이면 자동으로 role="gif"로 설정 (사용자가 명시적으로 다른 role을 지정하지 않은 경우)
    const isGif = file.type === "image/gif";
    if (isGif && role !== "gif") {
      role = "gif";
    }

    const ext = file.name.split(".").pop() || "jpg";
    const shortId = generateShortId(8);
    const timestamp = Date.now();
    const path = `${user.id}/${timestamp}-${shortId}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { data: uploaded, error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[upload]", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(uploaded.path);

    return NextResponse.json({
      success: true,
      image: {
        id: shortId,
        url: publicUrlData.publicUrl,
        path: uploaded.path,
        role,
        order: 0,
        size: file.size,
        name: file.name,
        mime_type: file.type,
        // GIF는 기본 삽입 위치를 'after_points' (소비자 선호도 1위 위치)로 설정
        ...(isGif ? { gif_position: "after_points" } : {}),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다.";
    console.error("[upload:catch]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
