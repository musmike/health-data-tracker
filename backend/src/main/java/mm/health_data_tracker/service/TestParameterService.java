package mm.health_data_tracker.service;

import lombok.RequiredArgsConstructor;
import mm.health_data_tracker.dto.TestParameterDto;
import mm.health_data_tracker.model.AppUser;
import mm.health_data_tracker.model.TestParameter;
import mm.health_data_tracker.repository.AppUserRepository;
import mm.health_data_tracker.repository.TestParameterRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestParameterService {

    private final TestParameterRepository parameterRepository;
    private final AppUserRepository userRepository;

    public List<TestParameterDto> getAllParametersForUser(String username) {
        return parameterRepository.findSystemAndUserParameters(username).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public TestParameterDto createPrivateParameter(TestParameterDto dto, String username) {
        AppUser creator = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TestParameter param = new TestParameter();
        param.setName(dto.getName());
        param.setUnit(dto.getUnit());
        param.setMinNorm(dto.getMinNorm());
        param.setMaxNorm(dto.getMaxNorm());
        param.setCreator(creator);

        TestParameter saved = parameterRepository.save(param);
        return mapToDto(saved);
    }

    private TestParameterDto mapToDto(TestParameter param) {
        TestParameterDto dto = new TestParameterDto();
        dto.setId(param.getId());
        dto.setName(param.getName());
        dto.setUnit(param.getUnit());
        dto.setMinNorm(param.getMinNorm());
        dto.setMaxNorm(param.getMaxNorm());
        return dto;
    }
}