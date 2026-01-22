package mm.health_data_tracker.controller;

import lombok.RequiredArgsConstructor;
import mm.health_data_tracker.dto.TestParameterDto;
import mm.health_data_tracker.service.TestParameterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/parameters")
@CrossOrigin
@RequiredArgsConstructor
public class TestParameterController {

    private final TestParameterService parameterService;

    @GetMapping
    public List<TestParameterDto> getParameters(Principal principal) {
        return parameterService.getAllParametersForUser(principal.getName());
    }

    @PostMapping
    public ResponseEntity<TestParameterDto> addParameter(@RequestBody TestParameterDto dto, Principal principal) {
        return ResponseEntity.ok(parameterService.createPrivateParameter(dto, principal.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteParameter(@PathVariable Long id, Principal principal) {
        parameterService.deleteParameter(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestParameterDto> updateParameter(@PathVariable Long id,
                                    @RequestBody TestParameterDto dto, Principal principal) {
        return ResponseEntity.ok(parameterService.updateParameter(id, dto, principal.getName()));
    }
}