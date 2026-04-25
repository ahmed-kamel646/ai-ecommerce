package com.ahmed.ecommerce.storage;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class LocalStorageService implements StorageService {

    private final Path rootLocation;
    private final String publicBaseUrl;

    public LocalStorageService(
            @Value("${app.uploads.dir}") String uploadsDir,
            @Value("${app.uploads.public-base-url}") String publicBaseUrl) {
        this.rootLocation = Paths.get(uploadsDir);
        this.publicBaseUrl = publicBaseUrl;
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage", e);
        }
    }

    @Override
    public String store(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new IllegalArgumentException("Failed to store empty file.");
            }
            String filename = UUID.randomUUID() + "-" + file.getOriginalFilename();
            Path destinationFile =
                    this.rootLocation.resolve(Paths.get(filename)).normalize().toAbsolutePath();
            if (!destinationFile.getParent().equals(this.rootLocation.toAbsolutePath())) {
                throw new IllegalArgumentException("Cannot store file outside current directory.");
            }
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }
            return publicBaseUrl + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file.", e);
        }
    }
}
