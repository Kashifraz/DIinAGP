package com.lms.service;

import com.lms.dto.CourseMajorDTO;
import com.lms.dto.CreateMajorRequest;
import com.lms.dto.UpdateMajorRequest;
import com.lms.entity.CourseMajor;
import com.lms.entity.User;
import com.lms.repository.CourseMajorRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseMajorService {

    private final CourseMajorRepository courseMajorRepository;
    private final UserRepository userRepository;

    @Transactional
    public CourseMajorDTO createMajor(CreateMajorRequest request, Long coordinatorId) {
        // Check if major name already exists
        if (courseMajorRepository.existsByName(request.getName())) {
            throw new RuntimeException("Major with name '" + request.getName() + "' already exists");
        }

        // Get coordinator
        User coordinator = userRepository.findById(coordinatorId)
                .orElseThrow(() -> new RuntimeException("Coordinator not found with id: " + coordinatorId));

        // Verify coordinator role
        if (!coordinator.getRole().equals(User.Role.COORDINATOR)) {
            throw new RuntimeException("User is not a coordinator");
        }

        // Create major
        CourseMajor major = new CourseMajor();
        major.setName(request.getName());
        major.setDescription(request.getDescription());
        major.setCoordinator(coordinator);
        major.setStatus(CourseMajor.Status.ACTIVE);

        major = courseMajorRepository.save(major);
        return convertToDTO(major);
    }

    public List<CourseMajorDTO> getAllMajors() {
        return courseMajorRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CourseMajorDTO getMajorById(Long id) {
        CourseMajor major = courseMajorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Major not found with id: " + id));
        return convertToDTO(major);
    }

    @Transactional
    public CourseMajorDTO updateMajor(Long id, UpdateMajorRequest request, Long coordinatorId) {
        CourseMajor major = courseMajorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Major not found with id: " + id));

        // Verify coordinator owns this major or is updating it
        if (!major.getCoordinator().getId().equals(coordinatorId)) {
            throw new RuntimeException("You don't have permission to update this major");
        }

        // Update name if provided and check uniqueness
        if (request.getName() != null && !request.getName().equals(major.getName())) {
            if (courseMajorRepository.existsByName(request.getName())) {
                throw new RuntimeException("Major with name '" + request.getName() + "' already exists");
            }
            major.setName(request.getName());
        }

        // Update description if provided
        if (request.getDescription() != null) {
            major.setDescription(request.getDescription());
        }

        // Update status if provided
        if (request.getStatus() != null) {
            major.setStatus(request.getStatus());
        }

        major = courseMajorRepository.save(major);
        return convertToDTO(major);
    }

    @Transactional
    public void deleteMajor(Long id, Long coordinatorId) {
        CourseMajor major = courseMajorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Major not found with id: " + id));

        // Verify coordinator owns this major
        if (!major.getCoordinator().getId().equals(coordinatorId)) {
            throw new RuntimeException("You don't have permission to delete this major");
        }

        // Soft delete by setting status to INACTIVE
        major.setStatus(CourseMajor.Status.INACTIVE);
        courseMajorRepository.save(major);
    }

    private CourseMajorDTO convertToDTO(CourseMajor major) {
        return new CourseMajorDTO(
                major.getId(),
                major.getName(),
                major.getDescription(),
                major.getCoordinator().getId(),
                major.getCoordinator().getFirstName() + " " + major.getCoordinator().getLastName(),
                major.getStatus(),
                major.getCreatedAt(),
                major.getUpdatedAt()
        );
    }
}

