package mm.health_data_tracker.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TestResultDto {
    private Long id;
    private Double value;
    private LocalDate date;
    private Long parameterId;
    private String parameterName;
    private String parameterUnit;
}