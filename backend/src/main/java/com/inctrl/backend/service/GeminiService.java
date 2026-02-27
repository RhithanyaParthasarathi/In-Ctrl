package com.inctrl.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${GEMINI_API_KEY}")
    private String geminiApiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Sends the raw GitHub diff and user context to Gemini to extract insights.
     */
    public String analyzeCommit(String githubDiffJson, String developerContext) {
        String systemPrompt = """
                You are an expert Senior Staff Software Engineer and Architecture Auditor.
                Your job is to read a raw GitHub Commit Diff and explain it to a junior developer.

                Based on the provided Git Diff and the Developer's Context, you must return a JSON response containing:
                1. 'summary': A plain English summary of what logic changed.
                2. 'technologies': A list of tech/libraries used (e.g. JPA, RxJS, Loops).
                3. 'alternatives': Provide TWO distinct alternative ways the code could have been written (other than what the AI suggested). Justify why those paths were not inherently chosen.
                4. 'faults': Provide at least TWO potential fracture points or risks (e.g., missing null checks, scaling issues, no retry logic).

                Return ONLY valid JSON.
                """;

        String userPrompt = String.format(
                "Developer's Context/AI Chat Log: %s\n\nGitHub Diff JSON: %s",
                (developerContext != null && !developerContext.isEmpty()) ? developerContext : "No context provided.",
                githubDiffJson);

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
                + geminiApiKey;

        try {
            // Build the Gemini API Request Body
            Map<String, Object> requestBody = Map.of(
                    "system_instruction", Map.of(
                            "parts", Map.of(
                                    "text", systemPrompt)),
                    "contents", List.of(
                            Map.of(
                                    "parts", List.of(
                                            Map.of("text", userPrompt)))),
                    "generationConfig", Map.of(
                            "response_mime_type", "application/json"));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);

            // Call the Gemini API
            String responseStr = restTemplate.postForObject(url, entity, String.class);

            // Extract the generated text from the response
            Map<String, Object> responseMap = objectMapper.readValue(responseStr, Map.class);
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseMap.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                if (parts != null && !parts.isEmpty()) {
                    return (String) parts.get(0).get("text");
                }
            }
            throw new RuntimeException("Unexpected response format from Gemini API");

        } catch (Exception e) {
            throw new RuntimeException("Failed to analyze commit with Gemini: " + e.getMessage(), e);
        }
    }

    /**
     * Answers a user's question about a commit using the raw diff as context.
     * Returns a Markdown-formatted answer that may include specific code references.
     */
    public String chatWithCommit(String githubDiffJson, String developerContext, String question) {
        String systemPrompt = """
                You are an expert Senior Staff Software Engineer acting as a personal code mentor.
                The developer has just reviewed a Git Commit Diff and has a question about it.

                Your job is to answer the developer's question clearly and concisely.
                Rules:
                - Use the provided Git Diff as your source of truth.
                - When referencing code, ALWAYS quote the exact lines from the diff using Markdown code blocks with the appropriate language tag (e.g. ```java, ```typescript).
                - Reference specific line changes (lines starting with + or -) when relevant.
                - Keep the answer focused on the question asked.
                - Format your full response in Markdown.
                """;

        String userPrompt = String.format(
                "Git Diff Context:\n%s\n\nDeveloper Context: %s\n\nDeveloper's Question: %s",
                githubDiffJson,
                (developerContext != null && !developerContext.isEmpty()) ? developerContext : "No extra context provided.",
                question);

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key="
                + geminiApiKey;

        try {
            Map<String, Object> requestBody = Map.of(
                    "system_instruction", Map.of(
                            "parts", Map.of(
                                    "text", systemPrompt)),
                    "contents", List.of(
                            Map.of(
                                    "parts", List.of(
                                            Map.of("text", userPrompt)))));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);

            String responseStr = restTemplate.postForObject(url, entity, String.class);

            Map<String, Object> responseMap = objectMapper.readValue(responseStr, Map.class);
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseMap.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                if (parts != null && !parts.isEmpty()) {
                    return (String) parts.get(0).get("text");
                }
            }
            throw new RuntimeException("Unexpected response format from Gemini API");

        } catch (Exception e) {
            throw new RuntimeException("Failed to chat with Gemini: " + e.getMessage(), e);
        }
    }
}
