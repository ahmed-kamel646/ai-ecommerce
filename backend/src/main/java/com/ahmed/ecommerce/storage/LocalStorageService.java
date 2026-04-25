package com.ahmed.ecommerce.storage;

import com.ahmed.ecommerce.common.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * Disk-backed storage. Files land under {@code app.uploads.dir/products/} and
 * are served by Spring's {@code ResourceHandler} at {@code /files/**}. Every
 * relative path is normalized and verified to remain inside the configured
 * root before it is written — protects against path-traversal payloads in the
 * original filename.
 */
@Slf4j
@Service
public class LocalStorageService implements StorageService {

    public static final long MAX_BYTES = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES = Set.of("image/png", "image/jpeg", "image/jpg", "image/webp");
    private static final Set<String> ALLOWED_EXTS = Set.of("png", "jpg", "jpeg", "webp");

    private final Path root;
    private final Path productsDir;

    public LocalStorageService(@Value("${app.uploads.dir:./uploads}") String uploadsDir) {
        this.root = Paths.get(uploadsDir).toAbsolutePath().normalize();
        this.productsDir = root.resolve("products").toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() throws IOException {
        Files.createDirectories(productsDir);
        if (!productsDir.startsWith(root)) {
            throw new IllegalStateException("products dir escaped uploads root");
        }
        log.info("LocalStorageService root={}", root);
    }

    @Override
    public StoredImage save(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Image file is required");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new BusinessException("Image exceeds 5MB limit");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!ALLOWED_TYPES.contains(contentType)) {
            throw new BusinessException("Unsupported image type: " + contentType);
        }
        String original = file.getOriginalFilename();
        String ext = extOf(original);
        if (!ALLOWED_EXTS.contains(ext)) {
            throw new BusinessException("Unsupported image extension: " + ext);
        }
        String filename = UUID.randomUUID() + "." + ext;
        Path target = productsDir.resolve(filename).toAbsolutePath().normalize();
        if (!target.startsWith(productsDir)) {
            throw new BusinessException("Resolved path escaped storage root");
        }
        byte[] bytes;
        try {
            bytes = file.getBytes();
            try (var in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            log.error("Failed to write upload to {}", target, e);
            throw new BusinessException("Failed to store image");
        }
        String url = "/files/products/" + filename;
        return new StoredImage(url, bytes, contentType);
    }

    private static String extOf(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        if (dot < 0 || dot == filename.length() - 1) return "";
        return filename.substring(dot + 1).toLowerCase(Locale.ROOT);
    }
}
