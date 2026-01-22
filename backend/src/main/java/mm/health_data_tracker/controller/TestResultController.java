package mm.health_data_tracker.controller;


import lombok.RequiredArgsConstructor;
import mm.health_data_tracker.dto.TestResultDto;
import mm.health_data_tracker.service.TestResultService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/results")
@CrossOrigin
@RequiredArgsConstructor
public class TestResultController {

    private final TestResultService resultService;

    @GetMapping
    public List<TestResultDto> getMyResults(Principal principal) {
        return resultService.getResultsForUser(principal.getName());
    }

    @PostMapping
    public ResponseEntity<TestResultDto> addResult(@RequestBody TestResultDto dto, Principal principal) {
        return ResponseEntity.ok(resultService.addResult(dto, principal.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResult(@PathVariable Long id, Principal principal) {
        resultService.deleteResult(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestResultDto> updateResult(@PathVariable Long id,
                              @RequestBody TestResultDto dto, Principal principal) {
        return ResponseEntity.ok(resultService.updateResult(id, dto, principal.getName()));
    }
}