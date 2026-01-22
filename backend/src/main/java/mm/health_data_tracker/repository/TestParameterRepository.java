package mm.health_data_tracker.repository;

import mm.health_data_tracker.model.TestParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestParameterRepository extends JpaRepository<TestParameter, Long> {
    @Query("SELECT p FROM TestParameter p WHERE p.creator IS NULL OR p.creator.username = :username")
    List<TestParameter> findSystemAndUserParameters(@Param("username") String username);
}