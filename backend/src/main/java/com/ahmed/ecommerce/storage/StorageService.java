package com.ahmed.ecommerce.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    /** Persist an uploaded image and return the public URL (e.g. {@code /files/products/foo.png}). */
    StoredImage save(MultipartFile file);

    record StoredImage(String url, byte[] bytes, String contentType) {
    }
}
