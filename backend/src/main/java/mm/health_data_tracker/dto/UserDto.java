package mm.health_data_tracker.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Data
public class UserDto {

    @NotBlank(message = "Login jest wymagany")
    @Size(min = 3, message = "Login musi mieć min. 3 znaki")
    private String username;

    @NotBlank(message = "Hasło jest wymagane")
    @Size(min = 8, message = "Hasło musi mieć min. 8 znaków")

    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$",
            message = "Hasło musi zawierać małą literę, dużą literę i cyfrę")
    private String password;

    @NotBlank(message = "Email jest wymagany")
    @Email(message = "Niepoprawny format email")
    private String email;
}