package mm.health_data_tracker.service;

import lombok.RequiredArgsConstructor;
import mm.health_data_tracker.dto.TestResultDto;
import mm.health_data_tracker.model.AppUser;
import mm.health_data_tracker.model.TestParameter;
import mm.health_data_tracker.model.TestResult;
import mm.health_data_tracker.repository.AppUserRepository;
import mm.health_data_tracker.repository.TestParameterRepository;
import mm.health_data_tracker.repository.TestResultRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestResultService {

    private final TestResultRepository resultRepository;
    private final TestParameterRepository parameterRepository;
    private final AppUserRepository userRepository;

    public List<TestResultDto> getResultsForUser(String username) {
        return resultRepository.findByUser_UsernameOrderByTestDateDesc(username).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public TestResultDto addResult(TestResultDto dto, String username) {
        AppUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TestParameter param = parameterRepository.findById(dto.getParameterId())
                .orElseThrow(() -> new RuntimeException("Parameter not found"));

        TestResult result = new TestResult();
        result.setValue(dto.getValue());
        result.setTestDate(dto.getDate());
        result.setUser(user);
        result.setParameter(param);

        TestResult saved = resultRepository.save(result);
        return mapToDto(saved);
    }

    private TestResultDto mapToDto(TestResult result) {
        TestResultDto dto = new TestResultDto();
        dto.setId(result.getId());
        dto.setValue(result.getValue());
        dto.setDate(result.getTestDate());
        dto.setParameterId(result.getParameter().getId());
        dto.setParameterName(result.getParameter().getName());
        dto.setParameterUnit(result.getParameter().getUnit());
        return dto;
    }
}