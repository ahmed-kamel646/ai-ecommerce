package com.ahmed.ecommerce.ai.vertex;

import com.ahmed.ecommerce.ai.DraftResult;
import com.ahmed.ecommerce.ai.GenerativeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * Stub Vertex generative service. The full implementation against
 * Gemini will land in a follow-up; for now this returns an empty
 * {@link DraftResult} so the orchestrator persists a placeholder
 * draft and the admin can fill the description in.
 */
@Slf4j
@Service
@ConditionalOnProperty(prefix = "ai", name = "provider", havingValue = "vertex")
public class VertexGenerativeService implements GenerativeService {

    private final String project;
    private final String location;
    private final String model;

    public VertexGenerativeService(@Value("${ai.vertex.project:${GOOGLE_CLOUD_PROJECT:}}") String project,
                                   @Value("${ai.vertex.location:us-central1}") String location,
                                   @Value("${ai.vertex.gemini-model:gemini-1.5-flash}") String model) {
        this.project = project;
        this.location = location;
        this.model = model;
    }

    @Override
    public DraftResult generateDraft(String name, String categoryName, byte[] imageBytes) {
        log.info("VertexGenerativeService stub for project={} model={}; returning empty draft", project, model);
        return DraftResult.empty();
    }
}
