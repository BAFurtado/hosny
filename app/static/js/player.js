require([
], function() {
  var person,
      socket;

  function renderBar(p, id) {
    var bar = $('#'+id),
        width = bar.width();
    bar.find('.bar-inner').width(p * width);
  }

  function castVote(vote) {
    $.ajax({
      type: "POST",
      url: "/vote",
      data: JSON.stringify({
        vote: vote,
        sid: socket.io.engine.id
      }),
      contentType: "application/json",
      success: function(data, textStatus, jqXHR) {
        console.log("vote successfully cast");
        setTimeout(function() {
          $('main').empty().html(renderTemplate('voted'));
        }, 1000);
      }
    });
  }

  function makeProposal(proposal) {
    $.ajax({
      type: "POST",
      url: "/propose",
      data: JSON.stringify({
        proposal: proposal
      }),
      contentType: "application/json",
      success: function(data, textStatus, jqXHR) {
        console.log("proposal successfully made");
        console.log(proposal);
      }
    });
  }

  function timeout(time, callback) {
    var fps = 30,
        timeout = 600,
        totalTime = timeout * fps;
        time = totalTime;
        updateInterval = setInterval(function() {
          time--;
          renderBar(time/totalTime, 'time');
          if (time <= 0) {
            callback();
            clearInterval(updateInterval);
          }
        }, 1/fps * 1000);
    return updateInterval;
  }

  function startProposal(proposals) {
    $("main").empty().html(renderTemplate('propose', {proposals: proposals}));
    var updateInterval = timeout(10, function() {
      makeProposal(null);
    });
    $('.proposal').empty().html(renderTemplate('proposal', proposals[0]));
    $('button').on('click', function() {
      var proposal = {
        type: $('[name=type]').val(),
        target: $('[name=target]').val(),
        value: $('[name=value]').val(),
        description: $('[name=description]').val()
      };
      makeProposal(proposal);
      clearInterval(updateInterval);
    });
    $('.proposals').on('change', function() {
      var proposalType = $(this).val(),
          proposal = _.find(proposals, function(p) { return p.type == proposalType });
      console.log('changed proposal to');
      console.log(proposalType);
      console.log(proposal);
      console.log(proposals);
      $('.proposal').empty().html(renderTemplate('proposal', proposal));
    });
  }

  function startVote(proposal) {
    $("main").empty().html(renderTemplate('vote', proposal));
    var updateInterval = timeout(10, function() {
      castVote(null);
    });
    $('button').on('click', function() {
      var val = $(this).val();
      castVote(val);
      clearInterval(updateInterval);
    });
  }

  function showPerson() {

    if (person.sex == 1) person.sex = "man";
    if (person.sex == 2) person.sex = "woman";

    if (person.race == 1) person.race = "Caucasian";
    if (person.race == 2) person.race = "Black";
    if (person.race == 3) person.race = "American Indian or Alaskan Native";
    if (person.race == 4 || person.race == 5) person.race = "East Asian";
    if (person.race == 6) person.race = "non-East Asian or Pacific Islander";
    if (person.race == 7 || person.race == 8) person.race = "mixed race";

    if (person.education == 0) person.education = "no education";
    if (person.education == 1 || person.education == 2) person.education = "middle school education";
    if (person.education == 3 || person.education == 4 || person.education == 5 || person.education == 6) person.education = "high school education";
    if (person.education == 7 || person.education == 8 || person.education == 9 || person.education == 10) person.education = "college undergraduate education";
    if (person.education == 11) person.education = "postgraduate education";

    if (person.employed == 0) person.employed = "in the armed forces";
    if (person.employed == 1) person.employed = "gainfully employed";
    if (person.employed == 2) person.employed = "unemployed";
    if (person.employed == 3) person.employed = " retired, student, those taking care of children or other family members, and others who are neither working nor seeking work";

    $("main").empty().html(renderTemplate('person', person));


  }

  $(function() {
    socket = io('/player');
    socket.on('propose', function(data) {
      startProposal(data.proposals);
    });

    socket.on('vote', function(data) {
      console.log('voting on:');
      console.log(data);
      startVote(data.proposal);
    });

    socket.on('person', function(data) {
      person = data;
      showPerson();
    });
  });
});
