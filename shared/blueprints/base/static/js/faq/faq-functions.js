// initialize FAQ functions
function initFaq() {
    toggleAnswer();
    findKeywords();
    resetInput();
}

initFaq();
  
function toggleAnswer() {
    let faq = document.querySelectorAll(".faq-question");
    faq.forEach(function(question) {
        question.addEventListener("click", function(e) {
            if(this.closest('.faq-group').classList.contains('active-search')) {
                this.closest('.faq-group').classList.remove('active-search');
                this.classList.remove("active");
                this.nextElementSibling.classList.add('max-h-0');
            } else {
                this.classList.toggle("active");
                this.nextElementSibling.classList.toggle('max-h-0');
                if(this.classList.contains("active") && window.innerWidth < 992 ) {
                    this.scrollIntoView();
                    window.scrollBy(0, -100);
                }
            }
        });
    });
}

function findKeywords() {
    
    let markOptions = {
        "diacritics": false,
        "each": function(node){
            node.closest('div').parentElement.classList.remove('max-h-0');
            node.closest('.faq-group').classList.add('active-search');
        }
    }

    let keywordInput = document.getElementById('keyword');
    let markInstance = new Mark(document.querySelector(".faq-section"));
    let keyword = keywordInput.value;
    let resetButton = document.querySelector('#keyword-input .reset');

    markInstance.unmark({
        done: function(){
            let answers = document.querySelectorAll(".faq-answer");
            answers.forEach(function(answer) {
                answer.parentElement.classList.remove('active-search');
                answer.closest('.faq-group').querySelector('.faq-question').classList.remove('active');
                answer.classList.add('max-h-0');
                // if(!answer.closest('.faq-group').querySelector('.faq-question').classList.contains('active')) {
                //     answer.classList.add('max-h-0');
                // }
            });

            markInstance.mark(keyword,markOptions);
        }
    });

    if(keywordInput.value.length > 0) {
        resetButton.classList.remove('invisible');
    } else {
        resetButton.classList.add('invisible');
    }

    keywordInput.addEventListener("input", self.findKeywords);
};

function resetInput() {
    document.querySelector('.reset').addEventListener('click',function() {
        document.getElementById('keyword').value = '';
        findKeywords();
    });
}
