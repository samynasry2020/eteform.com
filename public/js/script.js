$(document).ready(function() {
  $('#companyNameForm').on('submit', function(e) {
    e.preventDefault();
    const companyName = $('#companyName').val();
    $.ajax({
      url: '/check-name',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ companyName: companyName }),
      success: function(response) {
        $('#result').html(`<div class="alert alert-success"><i class="fas fa-check-circle"></i> ${response}</div>`);
      },
      error: function() {
        $('#result').html(`<div class="alert alert-danger"><i class="fas fa-times-circle"></i> Error checking company name</div>`);
      }
    });
  });
});
