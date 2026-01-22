package mm.health_data_tracker.repository;

import mm.health_data_tracker.model.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestResultRepository extends JpaRepository<TestResult, Long> {
    List<TestResult> findByUser_UsernameOrderByTestDateDesc(String username);
}