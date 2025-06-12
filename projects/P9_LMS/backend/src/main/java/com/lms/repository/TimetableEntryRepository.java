package com.lms.repository;

import com.lms.entity.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimetableEntryRepository extends JpaRepository<TimetableEntry, Long> {
    List<TimetableEntry> findByCourseId(Long courseId);
    List<TimetableEntry> findByCourseIdOrderByDayOfWeekAscStartTimeAsc(Long courseId);
    List<TimetableEntry> findByDayOfWeek(TimetableEntry.DayOfWeek dayOfWeek);
}

