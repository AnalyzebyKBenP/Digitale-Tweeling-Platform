var A11yToolbar = function() {
    
    var _contrast = 'contrast',
        _desaturate = 'desaturate',
        _fontsize = 'fontsize';
    
    return {
        
        init: function() {
            A11yToolbar.buildToolbar();
            A11yToolbar.setInitialState();
            A11yToolbar.listener();
            if(document.getElementById('access-mobile')) {
                A11yToolbar.mobileToggle();
            }
        },
        
        setInitialState: function() {
            var button;

            if (sessionStorage.getItem(_contrast) === 'true') {
                button = document.querySelector('.a11y-toolbar .a11y-control[data-a11y="' + _contrast + '"]');
                A11yToolbar.setActiveState(button, 'true', _contrast);
            }
            
            if (sessionStorage.getItem(_desaturate) === 'true') {
                button = document.querySelector('.a11y-toolbar .a11y-control[data-a11y="' + _desaturate + '"]');
                A11yToolbar.setActiveState(button, 'true', _desaturate);
            }
            
            if (sessionStorage.getItem(_fontsize) === 'true') {
                button = document.querySelector('.a11y-toolbar .a11y-control[data-a11y="' + _fontsize + '"]');
                A11yToolbar.setActiveState(button, 'true', _fontsize);
            }
        },
        
        buildToolbar: function() {
            var toolbar = `
                <div class="a11y-toolbar" role="region" aria-label="Accessibility Tools">
                    <ul>
                        <li>
                            <button type="button" class="a11y-control" data-a11y="${_fontsize}" aria-pressed="false" title="Toggle larger font size">
                                <span class="a11y-icon icon-fontsize" aria-hidden="true"></span>
                            </button>
                        </li>
                        <li>
                            <button type="button" class="a11y-control" data-a11y="${_contrast}" aria-pressed="false" title="Toggle high contrast">
                                <span class="a11y-icon icon-contrast" aria-hidden="true"></span>
                            </button>
                        </li>
                        <!-- <li>
                            <button type="button" class="a11y-control" data-a11y="${_desaturate}" aria-pressed="false" title="Toggle grayscale">
                                <span class="a11y-icon icon-grayscale" aria-hidden="true"></span>
                            </button>
                        </li> -->
                    </ul>
                </div>`

            document.querySelector('body').classList.add('has-a11y-toolbar');
            document.querySelector('#accessibility').insertAdjacentHTML('beforeEnd',toolbar);
        },
        
        buttonIsActive: function(button) {
            var attr = button.getAttribute('aria-pressed');
            if (attr === 'true') {
                return true;
            }
            return false;
        },
        
        setActiveState: function(button, state, mode) {
            if(button) {
                button.setAttribute('aria-pressed', state);
                A11yToolbar.updateBodyClass(mode, state);
            }
        },
        
        updateBodyClass: function(mode, state) {
            if (state == 'false') {
                document.querySelector('body').classList.remove('a11y-' + mode);
            } else {
                document.querySelector('body').classList.add('a11y-' + mode);
            }
        },
        
        listener: function() {
            let controls = document.querySelectorAll('.a11y-toolbar .a11y-control');
            controls.forEach(function(control){
                control.addEventListener('click',function(e) {
                    const button = e.currentTarget;
                    const mode = button.dataset.a11y;
                    if (A11yToolbar.buttonIsActive(button)) {
                        A11yToolbar.setActiveState(button, 'false', mode);
                        sessionStorage.setItem(mode,'false');
                    } else {
                        A11yToolbar.setActiveState(button, 'true', mode);
                        sessionStorage.setItem(mode,'true');
                    }
                });
                control.addEventListener('keydown',function(e) {
                    const key = e.which,
                    button = e.currentTarget,
                    mode = button.dataset.a11y;
                
                    if (key === 'Enter' || key === 'Space') {
                        if (A11yToolbar.buttonIsActive(button)) {
                            A11yToolbar.setActiveState(button, 'false', mode);
                            sessionStorage.setItem(mode,'false')
                        } else {
                            A11yToolbar.setActiveState(button, 'true', mode);
                            sessionStorage.setItem(mode,'true')
                        }
                        
                        return false;
                    } else {
                        return true;
                    }
                })
            });
        },

        mobileToggle: function() {
            document.getElementById('access-mobile').addEventListener('click', function(){
                this.classList.toggle('active');
                document.getElementById('accessibility').classList.toggle('active');
            });
        }
    };

}();

A11yToolbar.init();
