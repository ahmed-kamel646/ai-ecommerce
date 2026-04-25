package com.ahmed.ecommerce.ai.vertex;

import com.ahmed.ecommerce.ai.DraftResult;
import com.ahmed.ecommerce.ai.GenerativeService;
import com.google.cloud.vertexai.VertexAI;
import com.google.cloud.vertexai.api.GenerateContentResponse;
import com.google.cloud.vertexai.generativeai.GenerativeModel;
import java.util.Arrays;
import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "ai.provider", havingValue = "vertex")
public class VertexGenerativeService implements GenerativeService {

    private final VertexProperties properties;

    public VertexGenerativeService(VertexProperties properties) {
        this.properties = properties;
    }

    @Override
    public DraftResult draft(String productName, String categoryName) {
        try (VertexAI vertexAI = new VertexAI(properties.getProject(), properties.getLocation())) {
            GenerativeModel model = new GenerativeModel(properties.getTextModel(), vertexAI);

            String prompt =
                    String.format(
                            "Write a compelling product description for a %s named '%s'. Then, on a"
                                    + " new line starting with 'TAGS:', provide exactly 5 SEO tags"
                                    + " separated by commas. Do not use markdown formatting.",
                            categoryName, productName);

            GenerateContentResponse response = model.generateContent(prompt);
            String text = response.getCandidates(0).getContent().getParts(0).getText();

            String description = text;
            List<String> tags = List.of();

            if (text.contains("TAGS:")) {
                String[] split = text.split("TAGS:");
                description = split[0].trim();
                if (split.length > 1) {
                    tags =
                            Arrays.stream(split[1].split(","))
                                    .map(String::trim)
                                    .filter(s -> !s.isEmpty())
                                    .toList();
                }
            }

            return new DraftResult(description, tags);
        } catch (Exception e) {
            throw new RuntimeException("Vertex AI generation failed", e);
        }
    }
}
