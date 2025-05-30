import blogPosts from '../../src/database/BlogData.js';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

function BlogThumbnails() {
    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 8px' }}>
            <Row xs={1} md={2} lg={3} className="gx-3 gy-3">
                {blogPosts.map((post) => (
                    <Col key={post.id}>
                        <Card style={{ width: '100%' }}>
                            <Card.Img
                                variant="top"
                                src={`${process.env.PUBLIC_URL}${post.image[0]}`}
                                style={{ objectFit: 'cover', height: '200px', width: '100%' }}
                            />
                            <Card.Body>
                                <Card.Title className="fs-6">{post.title}</Card.Title>
                                <Card.Text className="small text-muted truncate-text">{post.description}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}

export default BlogThumbnails;
