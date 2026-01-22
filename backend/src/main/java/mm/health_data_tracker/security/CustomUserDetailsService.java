package mm.health_data_tracker.security;



import mm.health_data_tracker.dto.UserDto;
import mm.health_data_tracker.model.AppUser;
import mm.health_data_tracker.repository.AppUserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomUserDetailsService(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AppUser appUser = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return new User(
                appUser.getUsername(),
                appUser.getPassword(),
                Collections.emptyList()
        );
    }

    public AppUser save(UserDto userDto) {
        if (appUserRepository.existsByUsername(userDto.getUsername())) {
            throw new IllegalArgumentException("Użytkownik o takim loginie już istnieje");
        }
        if (appUserRepository.existsByEmail(userDto.getEmail())) {
            throw new IllegalArgumentException("Ten email jest już zajęty");
        }

        AppUser newUser = new AppUser();
        newUser.setUsername(userDto.getUsername());
        newUser.setEmail(userDto.getEmail());
        newUser.setPassword(passwordEncoder.encode(userDto.getPassword()));

        return appUserRepository.save(newUser);
    }
}