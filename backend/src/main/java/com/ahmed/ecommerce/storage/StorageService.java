package com.ahmed.ecommerce.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String store(MultipartFile file);
}
