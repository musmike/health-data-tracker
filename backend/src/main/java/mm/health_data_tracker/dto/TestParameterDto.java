package mm.health_data_tracker.dto;

import lombok.Data;

@Data
public class TestParameterDto {
    private Long id;
    private String name;
    private String unit;
    private Double minNorm;
    private Double maxNorm;
    private boolean privateParam;
}