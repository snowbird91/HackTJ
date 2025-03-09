

(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const passwordInput = document.getElementById('register-password');
        if (!passwordInput) return;


        const strengthIndicator = document.createElement('div');
        strengthIndicator.className = 'password-strength-indicator';
        strengthIndicator.innerHTML = `
      <div class="strength-meter">
        <div class="strength-meter-fill" id="strength-meter-fill"></div>
      </div>
      <div class="strength-text" id="strength-text">Password strength</div>
      <ul class="password-requirements">
        <li id="length-check">At least 8 characters</li>
        <li id="uppercase-check">At least one uppercase letter</li>
        <li id="lowercase-check">At least one lowercase letter</li>
        <li id="number-check">At least one number</li>
        <li id="special-check">At least one special character</li>
      </ul>
    `;


        passwordInput.parentNode.insertBefore(strengthIndicator, passwordInput.nextSibling);


        const styleEl = document.createElement('style');
        styleEl.textContent = `
      .password-strength-indicator {
        margin-top: 8px;
        font-size: 14px;
      }
      
      .strength-meter {
        height: 4px;
        background-color: #ddd;
        border-radius: 2px;
        margin-bottom: 8px;
      }
      
      .strength-meter-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 0.3s ease-in-out, background-color 0.3s ease-in-out;
        width: 0%;
      }
      
      .strength-text {
        margin-bottom: 8px;
        font-weight: bold;
      }
      
      .password-requirements {
        list-style-type: none;
        padding-left: 0;
        margin: 8px 0;
        font-size: 12px;
        color: #777;
      }
      
      .password-requirements li {
        margin-bottom: 4px;
        position: relative;
        padding-left: 20px;
      }
      
      .password-requirements li::before {
        content: "✗";
        position: absolute;
        left: 0;
        color: #e74c3c;
      }
      
      .password-requirements li.valid::before {
        content: "✓";
        color: #2ecc71;
      }
      
      .dark-mode .password-requirements {
        color: #aaa;
      }
      
      .dark-mode .strength-meter {
        background-color: #555;
      }
    `;
        document.head.appendChild(styleEl);


        passwordInput.addEventListener('input', function () {
            const password = this.value;


            const lengthCheck = password.length >= 8;
            const uppercaseCheck = /[A-Z]/.test(password);
            const lowercaseCheck = /[a-z]/.test(password);
            const numberCheck = /[0-9]/.test(password);
            const specialCheck = /[^A-Za-z0-9]/.test(password);

            document.getElementById('length-check').className = lengthCheck ? 'valid' : '';
            document.getElementById('uppercase-check').className = uppercaseCheck ? 'valid' : '';
            document.getElementById('lowercase-check').className = lowercaseCheck ? 'valid' : '';
            document.getElementById('number-check').className = numberCheck ? 'valid' : '';
            document.getElementById('special-check').className = specialCheck ? 'valid' : '';


            let strength = 0;
            if (lengthCheck) strength += 20;
            if (password.length >= 12) strength += 10;
            if (uppercaseCheck) strength += 20;
            if (lowercaseCheck) strength += 20;
            if (numberCheck) strength += 20;
            if (specialCheck) strength += 20;


            strength = Math.min(strength, 100);


            const fill = document.getElementById('strength-meter-fill');
            fill.style.width = strength + '%';


            if (strength < 30) {
                fill.style.backgroundColor = '#e74c3c';
            } else if (strength < 60) {
                fill.style.backgroundColor = '#f39c12';
            } else if (strength < 80) {
                fill.style.backgroundColor = '#3498db';
            } else {
                fill.style.backgroundColor = '#2ecc71';
            }


            const text = document.getElementById('strength-text');
            if (strength < 30) {
                text.textContent = 'Very weak';
                text.style.color = '#e74c3c';
            } else if (strength < 60) {
                text.textContent = 'Weak';
                text.style.color = '#f39c12';
            } else if (strength < 80) {
                text.textContent = 'Good';
                text.style.color = '#3498db';
            } else {
                text.textContent = 'Strong';
                text.style.color = '#2ecc71';
            }
        });


        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const debugBtn = document.createElement('button');
            debugBtn.type = 'button';
            debugBtn.textContent = 'Test Password';
            debugBtn.className = 'debug-password-btn';
            debugBtn.style.marginTop = '10px';
            debugBtn.style.padding = '5px 10px';
            debugBtn.style.fontSize = '12px';
            debugBtn.style.backgroundColor = '#6c757d';
            debugBtn.style.color = 'white';
            debugBtn.style.border = 'none';
            debugBtn.style.borderRadius = '4px';
            debugBtn.style.cursor = 'pointer';

            debugBtn.addEventListener('click', function () {
                const password = passwordInput.value;
                if (window.debugPassword) {
                    const result = window.debugPassword(password);
                    alert(`Password validation details:
Min length (8+): ${result.minLength ? '✓' : '✗'}
Has uppercase: ${result.hasUppercase ? '✓' : '✗'}
Has lowercase: ${result.hasLowercase ? '✓' : '✗'}
Has number: ${result.hasDigit ? '✓' : '✗'}
Has special char: ${result.hasSpecial ? '✓' : '✗'}
Overall valid: ${result.isValid ? '✓' : '✗'}`);
                } else {
                    alert("Password debug function not available");
                }
            });

            passwordInput.parentNode.appendChild(debugBtn);
        }
    });
})();
