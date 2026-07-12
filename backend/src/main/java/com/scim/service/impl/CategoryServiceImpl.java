package com.scim.service.impl;

import com.scim.dto.request.CategoryRequest;
import com.scim.dto.response.CategoryResponse;
import com.scim.entity.Category;
import com.scim.exception.BusinessException;
import com.scim.exception.DuplicateResourceException;
import com.scim.exception.ResourceNotFoundException;
import com.scim.mapper.CategoryMapper;
import com.scim.repository.CategoryRepository;
import com.scim.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAll(String search) {
        List<Category> categories = categoryRepository.findWithFilters(search, null);
        return categoryMapper.toResponseList(categories);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return categoryMapper.toResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Category", "code", request.getCode());
        }

        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "parent id", request.getParentId()));
        }

        Category category = categoryMapper.toEntity(request);
        category.setParent(parent);
        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }

        category = categoryRepository.save(category);
        log.info("Created category: {}", category.getCode());
        return categoryMapper.toResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (categoryRepository.existsByCodeAndIdNot(request.getCode(), id)) {
            throw new DuplicateResourceException("Category", "code", request.getCode());
        }

        Category parent = null;
        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new BusinessException("Danh mục cha không thể là chính nó.");
            }
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "parent id", request.getParentId()));
        }

        categoryMapper.updateEntity(request, category);
        category.setParent(parent);
        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }

        category = categoryRepository.save(category);
        log.info("Updated category: {}", category.getCode());
        return categoryMapper.toResponse(category);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        
        softDeleteRecursive(category);
        log.info("Soft deleted category and its children starting from: {}", category.getCode());
    }

    private void softDeleteRecursive(Category category) {
        category.setIsActive(false);
        categoryRepository.save(category);
        
        List<Category> children = categoryRepository.findByParentId(category.getId());
        for (Category child : children) {
            softDeleteRecursive(child);
        }
    }
}
