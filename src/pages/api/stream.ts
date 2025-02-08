import { runPrompt } from "../../utils/chatbot";

export async function POST({ request }: { request: Request }) {
  try {
    const { prompt } = await request.json(); // Read JSON body
    console.log("Received prompt:", prompt);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const responseStream = await runPrompt(prompt);
          for await (const chunk of responseStream) {
            controller.enqueue(encoder.encode(chunk + "\n"));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    return new Response("Invalid request", { status: 400 });
  }
}

export const prerender = false;
