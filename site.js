/*
 * The one script of this site: it reads your community's live data and puts it
 * on the page. Every page loads it and says which page it is with
 * <body data-page="home|about|blog|post|404">.
 *
 * WHERE THE DATA COMES FROM
 * Your site is served on your community's own address, next to your community
 * app, so the browser reads the community's PUBLIC API from the same origin —
 * no keys, no CORS:
 *   /api/public/site/v1/initial-data           name, logo, favicon
 *   /api/public/blog/post/all-posts            published posts, newest first
 *   /api/public/blog/post/<slug>/read          one post with its content
 *
 * SAFETY
 * Everything from the API is written with textContent / attributes, never as
 * HTML — except a post's body, which is rich text your own blog admins wrote in
 * the community editor, rendered exactly as the community's own blog page does.
 */
(function () {
  'use strict';

  var API = '/api/public';
  var page = document.body.getAttribute('data-page') || '';

  /* ------------------------------------------------------------------ data */

  function getJson(path) {
    return fetch(API + path, {headers: {accept: 'application/json'}})
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .then(function (body) {
        return body && body.data ? body.data : null;
      })
      .catch(function () {
        return null;
      });
  }

  function authorName(author) {
    var joined = [author.firstName, author.lastName].filter(Boolean).join(' ');
    return (author.displayName || '').trim() || joined.trim() || 'Unknown author';
  }

  /* --------------------------------------------------------------- helpers */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function all(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  }

  function initials(name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (word) {
        return word[0].toUpperCase();
      })
      .join('');
  }

  function formatDate(value) {
    if (!value) return '';
    var date = new Date(value);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  }

  function stripTags(html) {
    return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function preview(excerpt, html, max) {
    var text = (excerpt || '').trim() || stripTags(html);
    return text.length > max ? text.slice(0, max).trim() + '…' : text;
  }

  function postUrl(slug) {
    return '/blog/post/?slug=' + encodeURIComponent(slug);
  }

  function setTitle(pageName, siteName) {
    if (!siteName) return;
    document.title = pageName ? pageName + ' · ' + siteName : siteName;
  }

  /* ----------------------------------------------------------------- brand */

  function brandMark(site, size) {
    var name = (site && site.name) || 'Community';
    if (site && site.logo) {
      var img = el('img', 'brand-logo');
      img.src = site.logo;
      img.alt = name;
      img.height = size;
      img.style.height = size + 'px';
      return img;
    }
    var mono = el('span', 'brand-monogram', initials(name));
    mono.setAttribute('aria-hidden', 'true');
    mono.style.width = size + 'px';
    mono.style.height = size + 'px';
    mono.style.fontSize = size * 0.4 + 'px';
    return mono;
  }

  function renderBrand(site) {
    var name = (site && site.name) || 'Community';

    all('[data-brand-name]').forEach(function (node) {
      node.textContent = name;
    });
    all('[data-brand-mark]').forEach(function (node) {
      var size = Number(node.getAttribute('data-brand-mark')) || 32;
      node.replaceChildren(brandMark(site, size));
    });
    all('[data-year]').forEach(function (node) {
      node.textContent = String(new Date().getUTCFullYear());
    });

    if (site && site.favIcon) {
      var icon = document.querySelector('link[rel="icon"]') || el('link');
      icon.rel = 'icon';
      icon.href = site.favIcon;
      document.head.appendChild(icon);
    }

    var titles = {home: '', about: 'About', blog: 'Blog', 404: 'Page not found'};
    if (page in titles) setTitle(titles[page], site && site.name);
  }

  /* ----------------------------------------------------------------- posts */

  function postCard(post) {
    var card = el('a', 'post-card');
    card.href = postUrl(post.slug);

    if (post.coverUrl) {
      var img = el('img', 'cover');
      img.src = post.coverUrl;
      img.alt = '';
      img.loading = 'lazy';
      card.appendChild(img);
    } else {
      card.appendChild(el('span', 'cover cover-empty'));
    }

    var body = el('div', 'post-card-body');
    body.appendChild(el('h3', '', post.title));
    body.appendChild(el('p', 'muted small', preview(post.excerpt, '', 110)));
    body.appendChild(el('p', 'meta', formatDate(post.publishedAt)));
    card.appendChild(body);
    return card;
  }

  function renderGrid(target, posts) {
    target.replaceChildren.apply(target, posts.map(postCard));
  }

  function loadHome() {
    var section = document.getElementById('latest-posts');
    if (!section) return;
    getJson('/blog/post/all-posts?page=1&per_page=3').then(function (data) {
      var posts = (data && data.data) || [];
      if (posts.length === 0) return;
      renderGrid(document.getElementById('latest-grid'), posts);
      section.hidden = false;
    });
  }

  function loadBlog() {
    var params = new URLSearchParams(location.search);
    var current = Math.max(1, Number(params.get('page')) || 1);
    var grid = document.getElementById('blog-grid');
    var empty = document.getElementById('blog-empty');
    var pager = document.getElementById('blog-pager');

    getJson('/blog/post/all-posts?page=' + current + '&per_page=9').then(function (data) {
      var posts = (data && data.data) || [];
      var meta = (data && data.meta) || {};
      var last = meta.lastPage || 1;

      if (posts.length === 0) {
        grid.replaceChildren();
        empty.hidden = false;
        return;
      }
      renderGrid(grid, posts);

      if (last > 1) {
        var nodes = [];
        if (current > 1) {
          var newer = el('a', '', '← Newer');
          newer.href = current - 1 === 1 ? '/blog/' : '/blog/?page=' + (current - 1);
          nodes.push(newer);
        }
        nodes.push(el('span', 'muted small', 'Page ' + current + ' of ' + last));
        if (current < last) {
          var older = el('a', '', 'Older →');
          older.href = '/blog/?page=' + (current + 1);
          nodes.push(older);
        }
        pager.replaceChildren.apply(pager, nodes);
        pager.hidden = false;
      }
    });
  }

  function loadPost(site) {
    var slug = new URLSearchParams(location.search).get('slug');
    var view = document.getElementById('post');
    var missing = document.getElementById('post-missing');

    function notFound() {
      view.hidden = true;
      missing.hidden = false;
      setTitle('Post not found', site && site.name);
    }

    if (!slug) return notFound();

    getJson('/blog/post/' + encodeURIComponent(slug) + '/read').then(function (post) {
      if (!post) return notFound();

      setTitle(post.title, site && site.name);
      document.getElementById('post-title').textContent = post.title;

      var hero = document.getElementById('post-hero');
      if (post.coverUrl) {
        // Quoted so a url containing ( or ) cannot end the css function early.
        hero.style.backgroundImage = 'url("' + post.coverUrl.replace(/"/g, '%22') + '")';
      }

      var meta = document.getElementById('post-meta');
      var parts = (post.authors || []).map(function (author) {
        var chip = el('span', 'author');
        var name = authorName(author);
        if (author.avatar) {
          var img = el('img');
          img.src = author.avatar;
          img.alt = '';
          img.width = 24;
          img.height = 24;
          chip.appendChild(img);
        } else {
          var fallback = el('span', 'avatar-fallback', initials(name));
          fallback.setAttribute('aria-hidden', 'true');
          chip.appendChild(fallback);
        }
        chip.appendChild(document.createTextNode(name));
        return chip;
      });
      if (post.publishedAt) parts.push(el('span', '', formatDate(post.publishedAt)));
      var words = stripTags(post.content).split(/\s+/).filter(Boolean).length;
      parts.push(el('span', '', Math.max(1, Math.ceil(words / 265)) + ' minute read'));
      meta.replaceChildren.apply(meta, parts);

      // The one HTML write — see the file header.
      document.getElementById('post-body').innerHTML = post.content || '';

      var terms = document.getElementById('post-terms');
      var chips = (post.categories || [])
        .map(function (term) {
          return el('span', 'chip', term.name);
        })
        .concat(
          (post.tags || []).map(function (term) {
            return el('span', 'chip chip-tag', '#' + term.name);
          })
        );
      if (chips.length > 0) {
        terms.replaceChildren.apply(terms, chips);
        terms.hidden = false;
      }

      view.hidden = false;
    });
  }

  /* ------------------------------------------------------------------ boot */

  getJson('/site/v1/initial-data').then(function (site) {
    renderBrand(site);
    if (page === 'post') loadPost(site);
  });

  if (page === 'home') loadHome();
  if (page === 'blog') loadBlog();
})();
